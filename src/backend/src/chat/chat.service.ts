import { Injectable } from '@nestjs/common';
import { ChatRoomStoreService, Room } from '../store/store.room.service';
import { ChatUserStoreService, User } from '../store/store.user.service';
import { ChatMessageStoreService, Message, DM } from '../store/store.message.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {
  currRoomInfo,
  formedMessage,
  queryResponseRoomInfo,
  roomInfo,
  userInfo,
} from './chat.types';

@Injectable()
export class ChatService {
	constructor(
		private storeUser : ChatUserStoreService,
		private storeRoom : ChatRoomStoreService,
		private storeMessage : ChatMessageStoreService,
		private jwtService : JwtService
	){}

	//이렇게 사용 가능? -> 불가
	//????
	// @WebSocketServer()
	// server : Server;

	async clientAuthentification(client : Socket) : Promise<number> {
		
		try {
			const cookies = client.handshake.headers.cookie.split(";");

			const findAccessToken = (cookies : string[]) => {
				for (const string of cookies) {
				if (string.includes("access_token")) {
					const firstIdx = string.indexOf("=");
					const res = string.substring(firstIdx + 1);
					return res; // Return the value and exit the function
				}
				}
				return null; // Return null if not found
			};
			
			const jwtToken = findAccessToken(cookies);
			console.log("here");
			const payload = await this.jwtService.verifyAsync(jwtToken,
			{
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			});
			return (payload.id);
		} catch {
			console.log("you got error");
		}
	}

	//유저가 처음 들어왔을 때
	//1. userId가 Userlist 에 있는지 확인 -> //있는 유저라면 유저 정보를 불러와서 DM 방 구축 (dm방은 유저로..) <- 이 단계에서는 안 해도 되는듯?
	//2. userId가 없는 아이디라면 Userlist에 새 유저를 만들고 등록
	//0. default방과 자신의 이름을 가진 방에 넣는다($으로 시작하도록 방이름 설정)(DM용)
	//3. currRoom을 default로 설정
	//4. init method를 이용해서 전체 chatRoomList, default방에 접속한 전체 유저 리스트, default방의 메세시 정보를 보낸다.
	//매개변수를 이렇게 던지는게 좋을까 아니면 그 때마다 안에서 findUser findRoom하는게 좋을까...? 어렵다 어려워
	//TODO : 처음 들어올 때는 nickname이 있긴 해야함ㅠㅠ
	//TODO : 유저가 소켓 연결을 하기 전에 닉네임을 변경하는 경우가 있는지 확인할 것
		//만약 그 경우에는 매 최초 접속마다 유저 닉네임 업데이트가 필요한지 확인을 거쳐야 한다 <- 아직 안 되어있음
	async newUserConnected(io : Server, client : Socket, userId : number, nickname : string) : Promise<void> {
		client.join(`$${userId}`);
		let user : User = this.storeUser.findUserById(userId);
		if (user === undefined)
			user = this.storeUser.saveUser(userId, new User(userId, nickname));
		console.log("new user" + JSON.stringify(user));
		// console.log("new user" + user);
		user.connected = true;
		await this.userJoinRoomAct(io, user, "DEFAULT");	//이게 마지막에 실행된다... 안돼...
		user.currentRoom = "DEFAULT";
		
		//datarace... 괜찮을까
		//TODO: 전체방은 챗방 목록에 뜨게 할건지?(안하면 전체방 다시 돌아가고 싶을 때 어떻게 할지!)
		// const roomInfo : roomInfo[] = this.makeRoomInfo(user.joinlist);
		// const userInfo : userInfo[] = this.makeRoomUserInfo("DEFAULT");
		// const currRoomInfo : currRoomInfo = this.makeCurrRoomInfo("DEFAULT");
		// client.emit("init", userInfo, roomInfo, currRoomInfo);

		// //LOG : //
		// console.log("ROOM INFO " + JSON.stringify(roomInfo));
		// console.log("USER INFO " + JSON.stringify(userInfo));
		// console.log("CURR ROOM " + JSON.stringify(currRoomInfo));
	}

	//유저가 나갈 때
	//disconnectinga
		//유저가 소속된 모든 방에 유저가 나간다는 메세지를 emit한다 (이 메세지는 저장 x? 저장?)
		//유저가 속한 모든 방에서 유저 접속을 단절 <- 이건 소켓이 해준다.
		//유저가 속한 각 방에서 유저가 owner이거나 operator인지 체크한다
		//유저가 owner라면 owner을 바꾼다	//javascript set에 순서가 있는지
		//유저가 operator라면 operator를 해제한다.
		//해당 방의 userlist에서도 unset
		//만약 유저가 혼자 있는 방이라면 <- 방 자체를 rooms에서 삭제한다
	//disconnect
		//0. 유저의 joinlist를 전부 해제
		//1. 유저의 connected 상태 false
		//2. 유저의 isGaming 상태도 false	//게임 중 접속 끊길 수도 있음... <- 만약 접속이 잠시 끊겼다가 재접속 하면 어떻게?
	async disconnectUser(io: Server, userId : number) : Promise<void> {
		const user = this.storeUser.findUserById(userId);
		user.connected = false;
		this.userLeaveRooms(io, userId, user.joinlist);
	}

	// client.join("DEFAULT");
	// client.join(`$${user.id}`);
	async userJoinRoomAct(io: Server, user : User, roomname : string) {
		console.log(`client: ${user.id} join success roomname : ${roomname}`);
		//유저 소켓을 모두 찾아서 방으로 join 해주고
		const sockets = await io.in(`$${user.id}`).fetchSockets();
		sockets.forEach((socket) => {
			// console.log("user joined : " + roomname);
			socket.join(roomname);
		})
		//이미 유저의 joinlist에 방이 있는지 확인
		//없으면
		//유저 객체 joinlist add, 방 객체 userlist add
		//방에다가 welcome message
		//currRoom을 바꿔준다
		console.log("userJoinRoomAct : enter --------------------------------------------0")
		if (!user.joinlist.has(roomname))
		{
			console.log("userJoinRoomAct : enter --------------------------------------------1")
			
			user.joinlist.add(roomname);
			const room = this.storeRoom.findRoom(roomname);
			room.addUserToUserlist(user.id);
			console.log("userJoinRoomAct : enter --------------------------------------------2")
			//CHECK : 이런 welcome message도 저장할 것인가?
			const body = `Welcome ${user.nickname} !`;
			const message = new Message(-1, body);
			io.in(roomname).emit("sendMessage", roomname, {
				from : "Server_Admin",
				body : body,
				at : message.at
			});
			room.messages.push(message);
			const sockets2 = await io.in(roomname).fetchSockets();
			const roomMembers = this.makeRoomUserInfo(roomname);
			sockets2.forEach((socket) => {
				if (this.storeUser.findUserById(socket.data.id).currentRoom === roomname)
					socket.emit("sendRoomMembers", roomMembers);
			})
		}
		user.currentRoom = roomname;
		const currRoomInfo = this.makeCurrRoomInfo(roomname);
		const roomMembers = this.makeRoomUserInfo(roomname);
		const roomInfo = this.makeRoomInfo(user.joinlist);
		console.log("userJoinRoomAct : enter --------------------------------------------3")
		//연산이.... 좀 더 들긴하지만 새 방이 만들어질때를 생각하면 이게 최선이다...
		// this.emitEventsToAllSockets(io, user.id, "sendRoomList", this.makeRoomInfo(user.joinlist));
		// this.emitEventsToAllSockets(io, user.id, "sendRoomMembers", roomMembers);
		// this.emitEventsToAllSockets(io, user.id, "sendCurrRoomInfo", currRoomInfo);
		sockets.forEach((socket) => {
			console.log("res", roomInfo, roomMembers, currRoomInfo);
			socket.emit("sendRoomList", roomInfo);
			socket.emit("sendRoomMembers", roomMembers);
			socket.emit("sendCurrRoomInfo", currRoomInfo);
			socket.emit('hi', 'hi1');
		})
	}

	//userJoinRoom
	// 방이 이미 존재하는 방인지 확인  
		// 안 존재하는 방이라면
			//1. 방을 storeRoom에 등록한다.
			//2. 유저를 join 을 이용해서 그 방으로 연결해준다. (userlist에 등록한다)
			//3. welcome message!
		// 존재하는 방이라면
			//1. password 가 match 하는지 확인(TODO: 만약 입력안하면 무슨 값으로 들어오는지 체크)
				// password가 들어오지 않음 -> password를 요청하는 이벤트를 emit
				// password가 맞지 않음 -> password가 잘못되었다는 이벤트를 emit
			//2. banlist 를 확인
				// 리스트에 있으면 -> 일정시간동안 ban되었다는 이벤트를 emit
			//3. 유저를 join을 이용해서 그 방으로 연결(유저리스트 등록하고 welcome message)
	//if 3중 중첩문.... 이대로 괜찮은가.......

	//(CLOSE) 한 유저가 여러 소켓을 가진 경우에 대해 : 모든 창에 경고를 띄울 필요 있을까? -> 창하나만
	//하지만 join은 전부 처리해줘야 (CLOSE)
	JoinRoomBanCheck(io : Server, client:Socket, room : Room) : boolean {
		console.log(room.banlist);
		if (room.isBanned(client.data.id)){
			client.emit("sendAlert", "Banned User", "You are not allowed to join this room");
			return (false);
		}
		return (true);
	}

	async userJoinRoom(io : Server, client:Socket, roomname : string, password? : string) {
		const userId = client.data.id;
		let room = this.storeRoom.findRoom(roomname);
		console.log(`client: ${client.data.id} join roomname : ${roomname}`);
		if (room === undefined){
			console.log("userJoinRoom : enter --------------------------------------------1")
			this.storeRoom.saveRoom(roomname, new Room(userId, password? password : null));
			room = this.storeRoom.findRoom(roomname);
			this.userJoinRoomAct(io, this.storeUser.findUserById(userId), roomname);
			//(CLOSE) 전 서버 소켓들에게 새 방 생겼다고 다 알려줘야 함? -> 안 알려줌
			//새 방이 만들어질 땐 접속 후에 방 정보를 업데이트 해줘야 (그래야 새 방에 user Welcome message 가 lastMessage로 뜬다...)
		}
		else {
			//이미 들어간 방이면 password를 묻지 않는다.
			if (room.isJoinning(userId)){
				console.log("userJoinRoom : enter --------------------------------------------2")
				this.userJoinRoomAct(io, this.storeUser.findUserById(userId), roomname);
				return ;
			}
			if (room.isPrivate){
				client.emit("sendAlert", "Alert", "This room is Private");
				return ;
			}
			const pwExist = password? true : false;
			if (pwExist) {
				if (password){
					if (room.isPassword(password)){
						if (this.JoinRoomBanCheck(io, client, room))
							this.userJoinRoomAct(io, this.storeUser.findUserById(userId), roomname);
					}
					else
						client.emit("wrongPassword", roomname);
				}
				else
					client.emit("requestPassword", roomname);
			}
			else {
				if (this.JoinRoomBanCheck(io, client, room))
					this.userJoinRoomAct(io, this.storeUser.findUserById(userId), roomname);
			}
		}
	}

	setPassword(io: Server, client : Socket, roomname : string, password : string){
		const room = this.storeRoom.findRoom(roomname);
		if (room.isOwner(client.data.id))
			room.updatePassword(password);
		else
			client.emit("sendAlert", "Alert", "You have no authority");
	}

	setRoomStatus(io : Server, client : Socket, roomname : string, toPrivate : boolean) {
		const room = this.storeRoom.findRoom(roomname);
		if (room.isOwner(client.data.id)){
			if (toPrivate) {
				if (room.isPrivate)
					client.emit("sendAlert", "[ Alert ]", 'Room is already Private');
				else {
					room.isPrivate = true;
					io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
				}
			}
			else {
				if (room.isPrivate) {
					room.isPrivate = false;
					io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
				}
				else
					client.emit("sendAlert", "[ Alert ]", 'Room is already Public');
			}
		}
		else
			client.emit("sendAlert", "[ Alert ]", "Only owner can set room status");
	}

	//만약 없는 방일 때 -> throw Error
	//만약 방에 속한 유저가 아닐 때 -> throw Error? or ignore?
	//성공 시 message를 emit 하고 방의 message에 저장
	sendChat(io : Server, client: Socket, to : string, body : string){
		const room = this.storeRoom.findRoom(to);
		if (room === undefined){
			console.log("no such room");
			return ;
		}
		if (room.userlist.has(client.data.id)){	//이렇게 아이디를 잘 가져올 수 있는지 생각해보자(auth 올라가면 그냥 client.id로 꺼내도 됨 (이건 사실 nickname도 그렇다))
			if (!room.isMuted(client.data.id)){
				const message = new Message(client.data.id, body);
				io.in(to).emit("sendMessage", to, {
					from : client.data.nickname,
					body : body,
					at : message.at
				});
				room.messages.push(message);
			}
			else
				client.emit("sendAlert", "Attention", `You are MUTED in ${to}`);
		}
		else {
			console.log(room.userlist);
			console.log("you are not joining in this room");
		}
	
	}

	//userLeaveRoom
		//없는 방, 방에 속한 유저가 아닐 때 --> 이것도 체크하는 메소드 만들 수 있을 듯? : TODO --> 에러처리
		//적합한 경우
			// 유저가 유일한가?
				// 예 : 걍 방을 삭제한다
				// 아니
					// 유저가 owner인지 operator인지 확인
						// 승계하고 set에서 지우기
					// 방에 "유저가 나간다! 알림"
					// 해당 알림을 서버에 저장... <
				// 유저의 joinlist에서 방을 삭제
	//CHECK : 실제로 Socket Leave를 같이 붙여야 할까? 아니면 socket.io 처리랑 서비스 처리를 분리?
	//disconnect시에는 단절 자체가 leave를 자동으로 처리할 것
	//한 방만 나갈 때만 별도처리하는게 더 부하가 적지 않을까?
	userLeaveRoom(io : Server, userId : number, roomname : string){
		console.log(`client ${userId} leave roomname : ${roomname}`);
		const room = this.storeRoom.findRoom(roomname);
		const thisUser = this.storeUser.findUserById(userId);
		if (room === undefined){
			console.log("userLeaveRoom : enter --------------------------------------------1")
			
			console.log("Room does not exist");
			return ;
		}
		if (room.userlist.has(userId) && thisUser.joinlist.has(roomname)){
			if (room.userlist.size == 1)
			{
				console.log("userLeaveRoom : enter --------------------------------------------2")
				room.clearRoom();
				this.storeRoom.deleteRoom(roomname);
				thisUser.joinlist.delete(roomname);
				return ;
			}
			room.deleteUserFromUserlist(userId);
			if (room.isOwner(userId))
			{
				console.log("userLeaveRoom : enter --------------------------------------------3")
				const newOwner = room.userlist.values().next().value;
				room.updateOwner(newOwner);	//되는지 체크 : 아무나 owner로 올림!
			}
			if (room.isOperator(userId))
				room.deleteUserFromOperators(userId);	//처음에는 owner는 owner역할만 하지만, 첫 owner가 나갈 때  새로  들어오는  newOwner는 중복일 수  있음
			console.log("userLeaveRoom : enter --------------------------------------------4")
			thisUser.joinlist.delete(roomname);
			room.deleteUserFromUserlist(userId);
			const body = `Good bye ${thisUser.nickname}`
			io.to(roomname).emit("sendMessage", body);
			room.messages.push(new Message(-1, body));
			//해당방의 모든 소켓을 모아서, 소켓 유저아이디로 유저 객체에 접근 -> currRoom을 확인하고 보내기 vs 클라이언트가 처리하기
			io.to(roomname).emit("sendRoomMembers", this.makeRoomUserInfo(roomname));
			console.log("userLeaveRoom : enter --------------------------------------------5")
		}
		else
			console.log("you are not joining in this room : try leave");
	}
	
	async userLeaveRoomAct(io : Server, client : Socket, roomname : string){
		console.log(`client ${client.data.nickname} leave roomname : ${roomname} ACT`);
		
		const userid = client.data.id;
		const sockets = await io.in(`$${userid}`).fetchSockets();
		sockets.forEach((socket) => {
			socket.leave(roomname);
		})
		console.log("userLeaveRoom : enter --------------------------------------------0")
		this.userJoinRoomAct(io, this.storeUser.findUserById(client.data.id), "DEFAULT");
	}

	//userLeaveRooms -- userLeaveRoom 순회 / Set으로 충분? 아님 Array도 포함?
	userLeaveRooms(io : Server, userId : number, roomlist : Set<string>){
		roomlist.forEach((room) => {
			this.userLeaveRoom(io, userId, room);
		})
	}

	//operation : either kick / mute / ban	--> DISCUSS : 받으면 모듈창으로 메세지를 띄워주는게 좋을 것 같다

	//kickUser
	async kickUser(io : Server, roomname : string, targetId : number){
		const room = this.storeRoom.findRoom(roomname);
		//여기서 target한테 emit을 해야하는데... 어떻게...? 이게 문제네 흑흑 < DM방으로 실현하자... ! 와 DM만만세!
		if (room.isOperator(targetId))
			room.deleteUserFromOperators(targetId);
		room.deleteUserFromUserlist(targetId);
		//이하는 userLeave랑 작용이 같다
		const targetUser = this.storeUser.findUserById(targetId);
		targetUser.joinlist.delete(roomname);
		targetUser.currentRoom = "DEFAULT";
		this.userJoinRoomAct(io, targetUser, "DEFAULT");
		const body = `${targetUser.nickname} is Kicked Out`;
		io.to(roomname).emit("sendMessage", roomname, {
			from : "server",
			body : body,
			at : Date.now()
		});	//쫓겨나는 사람은 제하는게 좋을지도
		io.to(roomname).emit("sendRoomMembers", this.makeRoomUserInfo(roomname));
		room.storeMessage(-1, body);
		const sockets = await io.in(`$${targetId}`).fetchSockets();
		sockets.forEach((socket) => {
			socket.leave(roomname);
			socket.emit("sendAlert", "Attention", `You are kicked out from ${roomname}`);
			socket.emit("sendRoomMembers", this.makeRoomUserInfo("DEFAULT"));
		})
		//TODO & DISCUSS : checkValidity실패했을때 어떻게 할지
	}

	//banUser ... ban 기능을 생각해보자...
	banUser(io : Server, roomname : string, targetId : number){
		const room = this.storeRoom.findRoom(roomname);
		if (room.isOperator(targetId)){
			console.log("banUser: " + roomname + targetId);
			room.deleteUserFromOperators(targetId);
			room.deleteUserFromUserlist(targetId);
			//여기서 특정 시간동안 banlist에 올리고
			//kick하고
			//message를 보낸다
		}
		room.addUserToBanlist(targetId);
		this.kickUser(io, roomname, targetId);
	}

	muteUser(io : Server, client : Socket, roomname: string, targetId : number){
		const room = this.storeRoom.findRoom(roomname);
		if (room.isMuted(targetId))
			client.emit("sendMessage", roomname, {
				from : "server",
				body : `${this.storeUser.getNicknameById(targetId)} is already muted`,
				at : Date.now()
		})
		else{
			room.addUserToMutelist(targetId);
			this.emitEventsToAllSockets(io, targetId, "sendMessage", roomname, {
				from : "server",
				body : `You are temporaily muted by ${client.data.nickname}`,
				at : Date.now()
			})
			io.to(roomname).except(`$${targetId}`).emit("sendMessage", roomname, {
				from : "server",
				body :	`${this.storeUser.getNicknameById(targetId)} is temporaily muted`,
				at : Date.now()
			})
		}
	}

	blockUser(io : Server, client : Socket, target : string) {
		const thisUser = this.storeUser.findUserById(client.data.id);
		const targetId = this.storeUser.getIdByNickname(target);
		if (thisUser.blocklist.has(targetId))
			client.emit("sendAlert", "Notice", "You've already blocked this user");
		else {
			(thisUser.addUserToBlocklist(targetId));
			client.emit("sendAlert", "Notice", `Successfully block ${target}`);
		}
	}

	unblockUser(io : Server, client : Socket, target : string) {
		const thisUser = this.storeUser.findUserById(client.data.id);
		const targetId = this.storeUser.getIdByNickname(target);
		if (thisUser.blocklist.has(targetId)){
			(thisUser.deleteUserFromBlockList(targetId));
			client.emit("sendAlert", "Notice", `Successfully unblock ${target}`);
		}
		else {
			client.emit("sendAlert", "Failed", `${target} is not blocked yet`);
		}
	}

	//TODO : 이 모든 Getter들... 에러처리를 생각해야
	getAllRoomList() : roomInfo[] {
		const roomlist = Array.from(this.storeRoom.rooms.keys());
		return (this.makeRoomInfo(roomlist));
	}

	getUserRoomList(userId : number) : roomInfo[] {
		const thisUser = this.storeUser.findUserById(userId);
		return (this.makeRoomInfo(thisUser.joinlist));
	}

	//얘는 사실 딱히 최근 메세지 필요없는 것 같은데...(굳이 따지자면 방장이랑 참여인원이 있어야 하는게 아닐까?)
	//DISCUSS & CHECK : return form
	getQueryRoomList(query : string | null) : queryResponseRoomInfo[] {
		const res = [];
		if (query === null || query.length === 0)
			return (res);
		const roomlist = this.storeRoom.findQueryMatchRoomNames(query);
		roomlist.forEach((roomname) => {
			const room = this.storeRoom.findRoom(roomname);
			const owner = this.storeUser.getNicknameById(room.owner);
			// (Array.from([1, 2, 3], (x) => x + x));
			//TODO : 이게 일단 되는지 확인해야 한다...!
			const userlist = Array.from(
					room.userlist, 
					(user) => this.storeUser.getNicknameById(user)
				);
			//TODO : 사실 members에서 owner은 빼야해...!
			res.push({
				roomname : roomname,
				owner : owner,
				members : userlist
			})
		})
		return (res);
	}

	fetchDM(io : Server, from : number, to : number, body : string){
		const message = new DM(from, to, body);
		const res = {
			from : this.storeUser.getNicknameById(from),
			body : body,
			at : message.at
		};
		this.storeMessage.saveMessage(message);

		io.to([`$${from}`, `$${to}`]).emit("sendDM", this.storeUser.getNicknameById(to), res);
	}

	makeDMRoomMessages(from : string, to : string) : formedMessage[] {
		// TODO : 메세지가 순차적으로 담겨있는지 확인 필요
		const fromId = this.storeUser.getIdByNickname(from);
		const toId = this.storeUser.getIdByNickname(to);
		const msg = this.storeMessage
					.findMessagesForUser(fromId, toId)
					.map(message => ({
						from : this.storeUser.getNicknameById(message.from),
						to : this.storeUser.getNicknameById(message.to),
						body : message.body,
						at : message.at
					}));
		return (msg);
	}

	//이게 맞나....?
	makeUserStatus(userId : number, connection: boolean) : userInfo {
		const user = this.storeUser.findUserById(userId);
		const res = {
			id : userId,
			nickname : user.nickname,
			isGaming : user.isGaming,
			isConnected : user.connected
		}
		return (res);
	}
	
	// TODO :
	//자신의 닉네임 정보를 고치고
	//유저 정보 업뎃하고
	//참여 중인 모든 방에 이름 바꾼거... < 알려야 함? 이건 정하기 나름인 것 같다
	//사실 재접속해야 적용된다고 해도 할 말 없는거 아니냐구?ㅠ
	// userChangeNick(userId : number, newNick : string) {

	// }
	
	//userSendDM //양쪽에 저장하는게 낭비인가... 새 소켓이 들어올때마다 분류연산 해줘야 하는게 낭비인가ㅠ ㅇ<-<
	//selectDMRoom

	//blockUser? --> event 의논

	//TODO : 이하 util함수들 datarace 등 에러처리 어떻게 할지 // 아니 애초에 datarace가 나나...? 노드는 싱글 스레드(...) 소켓은 멀티플렉싱 으으으으
	//TODO : array나 set... 이렇게 되나...? error check
	makeRoomInfo(roomlist : string[] | Set<string>) : roomInfo[] {
		const res = [];
		roomlist.forEach((room : string) => {
			const messages = this.storeRoom.findRoom(room).messages;
			res.push({
				roomname : room,
				lastMessage : messages[messages.length - 1].body	//body만 보내도록
			})
		})
		return res;
	}

	makeRoomUserInfo(roomname : string) : userInfo[] {
		const userInfo = [];
		//만약 여기서 못 찾으면?
		const room : Room = this.storeRoom.findRoom(roomname);
		//or 만약 방에 아무 유저도 없으면? <- datarace일 때 가능성 있다.
		room.userlist.forEach((user) => {
			const target : User = this.storeUser.findUserById(user);
			// if (target.connected = true){	//체크할 필요 없는게 맞다.. disconnect할때 다 지워줌
			userInfo.push({
				id : user,
				nickname : target.nickname,
				isGaming : target.isGaming
			})
			// }
		})
		return (userInfo);
	}

	//CHECK : at을 과연 쓸지...? -> 쓴다
	mappingMessagesUserIdToNickname(messages : Message[]) : formedMessage[] {
		const res = [];
		messages.forEach((msg) => {
			res.push({
				from : `${this.storeUser.getNicknameById(msg.from)}`,
				body : msg.body,
				at : msg.at
			})
		})
		return (res);
	}

	//TODO: 여기 유저 본인이 operator인지 owner인지 체크 필요
	makeCurrRoomInfo(roomname : string) : currRoomInfo {
		const room = this.storeRoom.findRoom(roomname);
		// console.log("make CurrRoomInfo : " + JSON.stringify(room));
		const owner = this.storeUser.getNicknameById(room.owner);	//왜 한번씩 여기서 오류가 나는지...?
		const operatorList = [];
		const joineduserList = [];
		room.userlist.forEach((user) => {
			joineduserList.push(this.storeUser.getNicknameById(user));
		})
		room.operators.forEach((user) => {
			operatorList.push(this.storeUser.getNicknameById(user));
		})
		const res = {
			roomname : roomname,
			owner : owner,
			operators : operatorList,
			joinedUsers : joineduserList,
			messages : this.mappingMessagesUserIdToNickname(room.messages),
			isPrivate : room.isPrivate,
			isProtected : room.password ? true : false
		}
		return (res)
	}

	//check if "to" should be replaced with roomname
	async sendActResultToTarget(io : Server, roomname : string, target : number, operation: string){
		let notice : string;
		if (operation === "kick")
			notice = "Kicked out";
		else if (operation === "ban")
			notice = "Banned";
		else if (operation === "mute")
			notice = "Muted";
		const body = `You are ${notice} from Room "${roomname}"`
		await this.emitEventsToAllSockets(io, target, "sendMessage", roomname, {
				from : "server",
				body : body,
				at : Date.now()
		});
		// const sockets = await io.in(`$${target}`).fetchSockets();
		// sockets.forEach((socket) => {
		// 	socket.emit("sendMessage", "server", body);
		// })
	}

	//TODO : sendAlert message 분리하려면 이 함수에서 Socket 받아야함!
	//채팅방에서 어떤 행동을 할 때 가능한지 모두 체크 : 권한, 유효성, etc.
	checkActValidity(client : Socket, roomname : string, actor : number, target : number) : boolean {
		if (actor === target) {
			// console.log("[ ACT ERROR ] you can't do sth to yourself")
			client.emit("sendAlert", "[ ACT ERROR ]", "you can't do sth to yourself")
			return (false);
		}
		const room = this.storeRoom.findRoom(roomname);
		if (room === undefined){
			// console.log("[ ACT ERROR ] Room does not exist")
			client.emit("sendAlert", "[ ACT ERROR ]", "Room does not exist")
			return (false);
		}
		const user = this.storeUser.findUserById(actor);
		if (user === undefined || !user.joinlist.has(roomname)){
			// console.log("[ ACT ERROR ] invalid Actor");
			client.emit("sendAlert", "[ ACT ERROR ]", "invalid Actor")
			return (false);
		}
		if (!room.isOwner(user.id) && !room.isOperator(user.id)){
			// console.log("[ ACT ERROR ] Actor is not authorized");
			client.emit("sendAlert", "[ ACT ERROR ]", "Actor is not authorized")
			return (false);
		}
		if (target === -1){
			// console.log("[ ACT ERROR ] Target does not exist")
			client.emit("sendAlert", "[ ACT ERROR ]", "Target does not exist")
			return (false);
		}
		else if (!room.isJoinning(target)){
			// console.log("[ ACT ERROR ] Target is not joining this room");
			client.emit("sendAlert", "[ ACT ERROR ]", "Target is not joining this room")
			return (false);
		}
		else if (room.isOwner(target)){	//가능하면 owner랑 operator를 enum으로 만들어서 값 비교로 권한 우위 확인하면 더 좋았을듯.... 지금은 귀찮아...
			// console.log("[ ACT ERROR ] Target is the Owner");
			client.emit("sendAlert", "[ ACT ERROR ]", "Target is the Owner")
			return (false);
		}
		else if (room.isOperator(target) && !room.isOwner(actor)){
			// console.log("[ ACT ERROR ] Only owner can do sth to Operator");
			client.emit("sendAlert", "[ ACT ERROR ]", "Only owner can do sth to Operator")
			return (false);
		}
		return (true);
	}

	//TODO : 되는지 확인
	async emitEventsToAllSockets(io : Server, targetId : number, eventname : string, args1? : any, args2? : any) : Promise<void> {
		console.log(eventname + " " + args1 + " " + args2);
		const sockets = await io.in(`$${targetId}`).fetchSockets();
		sockets.forEach((socket) => {
			socket.emit(eventname, args1, args2);	//work?
		})
	}

	//CHECK : 좀 처리가 일관성이 없는게 joinlist도 persistent 하게 할지 말지 안 정해놓고 시작함ㅠ -> 주석 정리시 check
}
