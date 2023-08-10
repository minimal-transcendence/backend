import { Injectable } from '@nestjs/common';
import { ChatRoomStoreService, Room } from './store/store.room.service';
import { ChatUserStoreService, User } from './store/store.user.service';
// import { ChatMessageStoreService } from './store/store.message.service';
import { PrismaService } from 'src/prisma.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { currRoomInfo, formedMessage, roomInfo, userInfo } from './chat.types';
import { Message } from './store/store.message.service';
import { WebSocketServer } from '@nestjs/websockets';

@Injectable()
export class ChatService {
	constructor(
		private storeRoom : ChatRoomStoreService,
		private storeUser : ChatUserStoreService,
		// private storeMessage : ChatMessageStoreService,
		private prisma : PrismaService,
		private jwtService : JwtService
	){}

	//이렇게 사용 가능?
	@WebSocketServer()
	server : Server;

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
		let user = this.storeUser.findUserById(userId);
		if (user === undefined)
			user = this.storeUser.saveUser(userId, new User(userId, nickname));
		this.userJoinRoomSuccess(io, client, user, "DEFAULT");
		user.currentRoom = "DEFAULT";
		
		//datarace... 괜찮을까
		//TODO: 전체방은 챗방 목록에 뜨게 할건지?(안하면 전체방 다시 돌아가고 싶을 때 어떻게 할지!)
		const roomInfo = this.makeRoomInfo(user.joinlist);
		const userInfo = this.makeRoomUserInfo("DEFAULT");
		const currRoomInfo = this.makeCurrRoomInfo("DEFAULT");
		client.emit("init", userInfo, roomInfo, currRoomInfo);
	}

	//유저가 나갈 때
	//disconnecting
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
	async disconnectUser(client: Socket, userId : number) : Promise<void> {

	}

	// client.join("DEFAULT");
	// client.join(`$${user.id}`);
	userJoinRoomSuccess(io: Server, client:Socket, user : User, roomname : string) {
		//유저 소켓을 방으로 join 해주고
		client.join(roomname);
		//이미 유저의 joinlist에 방이 있는지 확인
		//없으면
		//유저 객체 joinlist add, 방 객체 userlist add
		//방에다가 welcome message
		//currRoom을 바꿔준다
		if (!user.joinlist.has(roomname))
		{
			user.joinlist.add(roomname);
			this.storeRoom.findRoom(roomname).addUserToUserlist(user.id);
			io.to(roomname).emit(`Welcome ${user.nickname} !`);
		}
		user.currentRoom = roomname;
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
	async userJoinRoom(client:Socket, userId : number, roomname : string, password? : string) {
		let room = this.storeRoom.findRoom(roomname);
		if (room === undefined){
			this.storeRoom.saveRoom(roomname, new Room(userId, password? password : null));
			room = this.storeRoom.findRoom(roomname);
			//TODO: 이렇게 server선언 되는지 확인해야함...!
			this.userJoinRoomSuccess(this.server, client, this.storeUser.findUserById(userId), roomname);
		}
		else {
			const pwExist = password? true : false;
			if (pwExist) {
				if (room.isPassword(password)){
					if (room.isBanned(userId))
						client.emit("youAreBanned", roomname);
					else
						this.userJoinRoomSuccess(this.server, client, this.storeUser.findUserById(userId), roomname);
				}
				else
					client.emit("wrongPassword", roomname);
			}
			else
				client.emit("requestPassword", roomname);
		}

	}

	//userLeaveRoom
	//userLeaveRooms -- userLeaveRoom 순회
	//userSendDM
	//userSendChat
	//kickUser
	//banUser
	//muteUser
	//blockUser?

	//TODO : 이하 util함수들 datarace 등 에러처리 어떻게 할지
	//TODO : array나 set... 이렇게 되나...? error check
	makeRoomInfo(roomlist : string[] | Set<string>) : roomInfo[] {
		const res = [];
		roomlist.forEach((room : string) => {
			const messages = this.storeRoom.findRoom(room).messages;
			res.push({
				roomname : room,
				lastMessage : `${messages[messages.length - 1]}`
			})
		})
		return res;
	}
	makeRoomUserInfo(roomname : string) : userInfo[] {
		const userInfo = [];
		//만약 여기서 못 찾으면?
		const room = this.storeRoom.findRoom(roomname);
		//or 만약 방에 아무 유저도 없으면? <- datarace일 때 가능성 있다.
		room.userlist.forEach((user) => {
			const target = this.storeUser.findUserById(user);
			userInfo.push({
				id : user,
				nickname : target.nickname,
				isGaming : target.isGaming
			})
		})
		return (userInfo);
	}

	//CHECK : at을 과연 쓸지...?
	mappingMessagesUserIdToNickname(messages : Message[]) : formedMessage[] {
		const res = [];
		messages.forEach((msg) => {
			res.push({
				from : `${this.storeUser.getNicknameById(msg.from)}`,
				body : msg.body
			})
		})
		return (res);
	}

	makeCurrRoomInfo(roomname : string) : currRoomInfo {
		const room = this.storeRoom.findRoom(roomname);
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
			owner : `${this.storeUser.findUserById(room.owner).nickname}`,
			operators : operatorList,
			joinedUsers : joineduserList,
			messages : this.mappingMessagesUserIdToNickname(room.messages)
		}
		return (res)
	}
}
