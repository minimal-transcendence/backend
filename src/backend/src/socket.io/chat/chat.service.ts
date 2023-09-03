import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatRoomStoreService, Room } from '../store/store.room.service';
import { ChatUserStoreService, User } from '../store/store.user.service';
import { ChatMessageStoreService, Message, DM } from '../store/store.message.service';
import { Namespace, Socket } from 'socket.io';
import {
	currRoomInfo,
	formedMessage,
	roomInfo,
	userInfo,
} from './types';
import { ChatSocket } from './types';

@Injectable()
export class ChatService {
	constructor(
		private storeUser: ChatUserStoreService,
		private storeRoom: ChatRoomStoreService,
		private storeMessage: ChatMessageStoreService,
	) { }

	initChatServer() {
		this.storeUser.saveUser(0, new User(0, 'Server_Admin'));
		this.storeRoom.saveRoom('DEFAULT', new Room()); //owner id 0 as server
	}

	updateUserStatus(io: Namespace, userId: number, isConnected: boolean) {
		io.emit("updateUserStatus", userId, isConnected);
	}

	//fetchSockets() returns RemoteSockets{}
	updateChatScreen(client: Socket, clientId: number, roomname: string) {
		const user = this.storeUser.findUserById(clientId);
		const currRoomInfo = this.makeCurrRoomInfo(roomname);
		const roomMembers = this.makeRoomUserInfo(roomname);
		const roomInfo = this.makeRoomInfo(user.blocklist, user.joinlist);
		client.emit("sendRoomList", roomInfo);
		client.emit("sendRoomMembers", roomMembers);
		client.emit("sendCurrRoomInfo", currRoomInfo);
	}

	updateRoom(io: Namespace, roomname: string) {
		const currRoomInfo = this.makeCurrRoomInfo(roomname);
		const roomMembers = this.makeRoomUserInfo(roomname);
		io.in(roomname).emit("sendRoomMembers", roomMembers);
		io.in(roomname).emit("sendCurrRoomInfo", currRoomInfo);
	}

	async extractSocketsInRoomById(io: Namespace, targetId: number, roomname: string): Promise<ChatSocket[]> {
		const res = [];
		const sockets = await io.in(roomname).fetchSockets()
			.catch((error) => {
				return (error.message);
			});
		sockets.forEach((socket: ChatSocket) => {
			if (socket.userId === targetId)
				res.push(socket);
		})
		return (res);
	}

	makeMessageFormat(
		fromId: number,
		body: string,
		save: boolean,
		to?: string
	): formedMessage | null {
		let msg = null;
		if (save && to) {
			msg = new Message(fromId, body);
			const room = this.storeRoom.findRoom(to);
			if (!room)	//ERROR
				return;
			room.messages.push(msg);
		}
		const format = {
			fromId: fromId,
			from: this.storeUser.getNicknameById(fromId),
			body: body,
			at: msg ? msg.at : Date.now()
		}
		return (format);
	}

	sendMsgToSocket(socket: ChatSocket, msg: formedMessage, roomname: string) {
		socket.emit("sendMessage", roomname, msg);
	}

	sendMsgToRoom(
		io: Namespace,
		fromId: number,
		to: string,
		body: string,
		save: boolean,
	): formedMessage {
		const format = this.makeMessageFormat(fromId, body, save, to);
		io.in(to).emit("sendMessage", to, format);
		return (format);
	}

	// bindUserRoom et unbindUserRoom
	// bindUserRoom(user : User, room : Room, roomname : string) {
	// 	user.joinlist.add(roomname);
	// 	room.addUserToUserlist(user.id);
	// }

	// unbindUserRoom(user : User, room : Room, roomname : string) {
	// 	user.joinlist.delete(roomname);
	// 	room.deleteUserFromUserlist(user.id);
	// }

	handleNewConnection(io: Namespace, client: ChatSocket) {
		const userId = client.userId;
		client.join(`$${userId}`);
		let user: User = this.storeUser.findUserById(userId);
		if (user === undefined)
			user = this.storeUser.saveUser(userId, new User(userId, client.nickname));
		if (user.connected === false) {
			if (client.nickname != user.nickname) {
				user.nickname = client.nickname;
			}
			user.connected = true;
			client.emit("sendBlocklist", [...user.blocklist]);
			this.updateUserStatus(io, userId, true);
			if (client.nickname !== user.nickname)
				user.nickname = client.nickname;
		}
		this.userJoinRoomAct(io, client, userId, "DEFAULT")
	}

	//마지막 하나일 때만 모든 방의 접속을 삭제한다
	//TODO & CHECK : if it works well...?
	async handleDisconnection(io: Namespace, client: ChatSocket): Promise<void> {
		const userId = client.userId;
		const isLastConn = (await io.in(`$${userId}`).fetchSockets()).length === 0;
		if (isLastConn) {
			console.log("is Last disconnction");
			const user = this.storeUser.findUserById(userId);
			user.connected = false;
			this.userLeaveRooms(io, client, user.joinlist);
			this.updateUserStatus(io, userId, false);
		}
		else
			console.log("is not Last disconnction");
	}

	async userJoinRoomAct(io: Namespace, client: any, clientId: number, roomname: string) {
		const user = this.storeUser.findUserById(clientId);
		if (!user.joinlist.has(roomname)) {
			const room = this.storeRoom.findRoom(roomname);
			if (!room) {
				client.emit("sendAlert", "[ Act Error ]", `${roomname} room is not exist`);
				return;
			}

			//bind room & user
			user.joinlist.add(roomname);
			room.addUserToUserlist(user.id);

			//save welcome message
			const body = `Welcome ${user.nickname} !`;
			this.sendMsgToRoom(io, 0, roomname, body, true);

			//send updateRoomMembers event to room
			const roomMembers = this.makeRoomUserInfo(roomname);
			io.in(roomname).emit("sendRoomMembers", roomMembers);
		}
		client.leave(client.currRoom)
		client.join(roomname);
		client.currRoom = roomname;
		console.log(`update Room  + `, roomname);
		this.updateChatScreen(client, clientId, roomname);
	}



	BanCheck(io: Namespace, client: ChatSocket, room: Room): boolean {
		if (room.isBanned(client.userId)) {
			client.emit("sendAlert", "[ Act Error ]", `You are banned from room ${room}`);
			return (false);
		}
		return (true);
	}

	async userJoinRoom(io: Namespace, client: ChatSocket, roomname: string, password?: string) {
		const userId = client.userId;
		let room = this.storeRoom.findRoom(roomname);
		if (room === undefined) {
			this.storeRoom.saveRoom(roomname, new Room(userId, password ? password : null));
			room = this.storeRoom.findRoom(roomname);
			this.userJoinRoomAct(io, client, userId, roomname);
		}
		else {
			if (room.isJoinning(userId)) {
				this.userJoinRoomAct(io, client, userId, roomname);
				return;
			}
			if (room.isPrivate) {
				client.emit("sendAlert", "[ Act Error ]", `${roomname} is Private Room`);
				return;
			}
			const pwExist = room.password ? true : false;
			if (pwExist) {
				if (password) {
					if (room.isPassword(password)) {
						if (this.BanCheck(io, client, room))
							this.userJoinRoomAct(io, client, userId, roomname);
					}
					else
						client.emit("wrongPassword", roomname);
				}
				else
					client.emit("requestPassword", roomname);
			}
			else {
				if (this.BanCheck(io, client, room))
					this.userJoinRoomAct(io, client, userId, roomname);
			}
		}
	}

	//TODO : Alert message 일관성 있게 정리하기
	setPassword(io: Namespace, client: ChatSocket, roomname: string, password: string) {
		const room = this.storeRoom.findRoom(roomname);
		if (room.isOwner(client.userId)) {
			room.updatePassword(password);
			client.emit("sendAlert", "[ Notice ]", "Password is updated");
		}
		else
			client.emit("sendAlert", "[ Act Error ]", "Only owner can change password");
	}

	//CHECK : error check
	setRoomStatus(io: Namespace, client: ChatSocket, roomname: string, toPrivate: boolean) {
		const room = this.storeRoom.findRoom(roomname);
		if (!room)
			throw new Error("Error : Room does not exist");
		if (room.isOwner(client.userId)) {
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
		else {
			console.log("Is not Owner");
			client.emit("sendAlert", "[ Act Error ]", "Only owner can set room status");
		}
	}

	sendChat(io: Namespace, client: ChatSocket, to: string, body: string) {
		const room = this.storeRoom.findRoom(to);
		if (room === undefined) {
			throw new Error("Error : Room does not exist");
		}
		if (room.userlist.has(client.userId)) {
			if (!room.isMuted(client.userId)) {
				const msg = this.sendMsgToRoom(io, client.userId, to, body, true);
				//현재 이 방에는 없지만 joinlist에 이 방을 가지고 있는 모든 socket... 쉽지않구만
				const users = this.storeUser.findAllUser().filter((user) => user.joinlist.has(to));
				if (users) {
					users.forEach((user) => {
						const roomInfo = this.makeRoomInfo(user.blocklist, user.joinlist);
						io.in(`$${user.id}`).except(to).emit("sendRoomList", roomInfo);
					})
				}
			}
			else
				client.emit("sendAlert", "[ Alert ]", `You are MUTED in ${to}`);
		}
		else {
			client.emit("sendAlert", "[ Act Error ]", `You are not joining in room ${to}`);
		}

	}

	userLeaveRoom(io: Namespace, client: ChatSocket, roomname: string) {
		const userId = client.userId;
		const room = this.storeRoom.findRoom(roomname);
		const thisUser = this.storeUser.findUserById(userId);
		if (room === undefined) {
			//혹은 socket에 emit? TODO : 일관성 있는 처리
			throw new Error("Error : Room does not exist");
		}
		if (room.userlist.has(userId) && thisUser.joinlist.has(roomname)) {
			if (room.userlist.size == 1 && roomname != "DEFAULT") {
				room.clearRoom();
				this.storeRoom.deleteRoom(roomname);
				thisUser.joinlist.delete(roomname);
			}
			else {
				//TODO : owner나 operator update 될 때 모든 유저에게 currRoomInfo 보내야하지 않는지...? < 보내자!
				if (room.isOwner(userId)) {
					const newOwner = room.userlist.values().next().value;
					room.updateOwner(newOwner);
					if (room.isOperator(newOwner))
						room.deleteUserFromOperators(newOwner);
					io.to(roomname).except(`$${userId}`).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
				}
				if (room.isOperator(userId)) {
					room.deleteUserFromOperators(userId);
					io.to(roomname).except(`$${userId}`).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
				}
				thisUser.joinlist.delete(roomname);
				room.deleteUserFromUserlist(userId);
				const body = `Good bye ${thisUser.nickname}`;
				this.sendMsgToRoom(io, 0, roomname, body, true);
				//CHECK : except 잘 작동하는지 확인
				io.to(roomname).except(`$${userId}`).emit("sendRoomMembers", this.makeRoomUserInfo(roomname));
			}
		}
		else
			console.log("you are not joining in this room : try leave");
	}

	async userLeaveRoomAct(io: Namespace, targetId: number, roomname: string, alertMsg?: string) {
		await this.extractSocketsInRoomById(io, targetId, roomname)
			.then((res) => {
				res.forEach((socket) => {
					socket.leave(roomname);
					this.updateChatScreen(socket, targetId, "DEFAULT");
					if (alertMsg)
						socket.emit("sendAlert", "[ Alert ]", `${alertMsg}`)
				})
			})
			.catch((error) => {
				//return 이냐 error냐...!
				throw new Error(error.message);
			});
	}

	userLeaveRooms(io: Namespace, client: ChatSocket, roomlist: Set<string>) {
		roomlist.forEach((room) => {
			this.userLeaveRoom(io, client, room);
		})
	}



	//kickUser TODO & CHECK : 이 부분 logic 다시 봐야됨!
	//banUser 랑 하부 로직이 완전히 같다...!
	async kickUser(io: Namespace, client: ChatSocket, roomname: string, targetName: string) {
		const targetId = this.storeUser.getIdByNickname(targetName);
		const room = this.storeRoom.findRoom(roomname);
		if (this.checkActValidity(client, roomname, targetId, "kick")) {
			// delete user from room & room from user
			const targetUser = this.storeUser.findUserById(targetId);
			room.deleteUserFromUserlist(targetId);
			targetUser.joinlist.delete(roomname);

			await this.userLeaveRoomAct(io, targetId, roomname, `You are kicked out from ${roomname}`);

			if (room.isOperator(targetId)) {
				room.deleteUserFromOperators(targetId);
				io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
			}
			//저장할건가...? (현재 false)
			const body = `${targetUser.nickname} is Kicked Out`;
			this.sendMsgToRoom(io, 0, roomname, body, false);
			io.to(roomname).emit("sendRoomMembers", this.makeRoomUserInfo(roomname));
		}
	}

	//ban을 할 수 있는가?
	async banUser(io: Namespace, client: ChatSocket, roomname: string, targetName: string) {
		const targetId = this.storeUser.getIdByNickname(targetName);
		const room = this.storeRoom.findRoom(roomname);
		if (this.checkActValidity(client, roomname, targetId, "ban")) {
			room.addUserToBanlist(targetId);

			// delete user from room & room from user
			const targetUser = this.storeUser.findUserById(targetId);
			room.deleteUserFromUserlist(targetId);
			targetUser.joinlist.delete(roomname);

			await this.userLeaveRoomAct(io, targetId, roomname, `You are temporaily banned from ${roomname}`);

			if (room.isOperator(targetId)) {
				room.deleteUserFromOperators(targetId);
				io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
			}
			//저장할건가...? (현재 false)
			const body = `${targetUser.nickname} is banned`;
			this.sendMsgToRoom(io, 0, roomname, body, false);
			io.to(roomname).emit("sendRoomMembers", this.makeRoomUserInfo(roomname));
		}
	}

	async muteUser(io: Namespace, client: ChatSocket, roomname: string, targetName: string) {
		const targetId = this.storeUser.getIdByNickname(targetName);
		const room = this.storeRoom.findRoom(roomname);
		if (!this.checkActValidity(client, roomname, targetId, "mute"))
			return;
		if (room.isMuted(targetId)) {
			const msg = this.makeMessageFormat(0, `${targetName} is already muted`, false);
			this.sendMsgToSocket(client, msg, roomname);
		}
		else {
			if (room.isOperator(targetId))
				room.deleteUserFromOperators(targetId);	//TODO & CHECK	//혹은 여기서는 그냥 해제 안 하는건?
			room.addUserToMutelist(targetId);
			let msg = this.makeMessageFormat(0, `${targetName} is now muted`, false);
			this.sendMsgToSocket(client, msg, roomname);
			const sockets = await this.extractSocketsInRoomById(io, targetId, roomname)
			sockets.forEach((socket) => {
				const msg = this.makeMessageFormat(0, `You are temporaily muted by ${this.storeUser.getNicknameById(client.userId)}`, false);
				this.sendMsgToSocket(socket, msg, roomname);
			})
			setTimeout(() => {
				room.deleteUserFromMutelist(targetId);
				sockets.forEach((socket) => {
					const msg = this.makeMessageFormat(0, `You are now unmuted`, false);
					this.sendMsgToSocket(socket, msg, roomname);
				})
			}, 20000);
		}
	}

	//TODO : makeBlocklist method & makeUserRender method 필요해....
	blockUser(io : Namespace, client : ChatSocket, target : string) {
		if (client.nickname === target){
			client.emit("sendAlert", "[ Act Error ]", "You can't block yourself");
			return ;
		}
		const thisUser = this.storeUser.findUserById(client.userId);
		const targetId = this.storeUser.getIdByNickname(target);
		if (thisUser.blocklist.has(targetId))
			client.emit("sendAlert", "[ Notice ]", "You've already blocked this user");
		else {
			(thisUser.addUserToBlocklist(targetId));
			client.emit("sendAlert", "[ Notice ]", `Successfully block ${target}`);
			const blocklist = [];
			thisUser.blocklist.forEach((user) => 
					blocklist.push(user));
			client.emit("sendBlocklist", blocklist);
		}
	}

	//TODO & CHECK unblockUser 할 때도 이렇게 하면 되나...?
	//이 경우에는 currRoomInfo, members 모두 보내줘야 하는거 아닌지...?
	unblockUser(io: Namespace, client: ChatSocket, target: string) {
		const thisUser = this.storeUser.findUserById(client.userId);
		const targetId = this.storeUser.getIdByNickname(target);
		if (thisUser.blocklist.has(targetId)) {
			(thisUser.deleteUserFromBlockList(targetId));
			client.emit("sendAlert", "[ Notice ]", `Successfully unblock ${target}`);
			const blocklist = [];
			thisUser.blocklist.forEach((user) =>
				blocklist.push(this.storeUser.getNicknameById(user)));
			// client.emit("sendBlocklist", blocklist); -> 여기서는 userlist 보내야 할 듯 CHECK
		}
		else {
			client.emit("sendAlert", "[ Notice ]", `${target} is not blocked yet`);
		}
	}

	addOperator(io: Namespace, client: ChatSocket, roomname: string, target: string) {
		const room = this.storeRoom.findRoom(roomname);
		if (!room.isOwner(client.userId))
			client.emit("sendAlert", "[ Act Error ]", "Only owner can add operator");
		else {
			const targetId = this.storeUser.getIdByNickname(target);
			if (room.isOperator(targetId))
				client.emit("sendAlert", "[ Act Error ]", "Target is already an operator");
			else {
				room.addUserToOperators(targetId);
				io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
			}
		}

	}

	deleteOperator(io: Namespace, client: ChatSocket, roomname: string, target: string) {
		const room = this.storeRoom.findRoom(roomname);
		if (!room.isOwner(client.userId))
			client.emit("sendAlert", "[ Act Error ]", "Only Owner can delete operator");
		else {
			const targetId = this.storeUser.getIdByNickname(target);
			if (room.isOperator(targetId)) {
				room.deleteUserFromOperators(targetId);
				io.to(roomname).emit("sendCurrRoomInfo", this.makeCurrRoomInfo(roomname));
			}
			else {
				client.emit("sendAlert", "[ Act Error ]", "target is not an operator");
			}
		}

	}

	getAllRoomList(userId: number): roomInfo[] | null {
		const roomlist = [];
		const blocklist = this.storeUser.findUserById(userId)?.blocklist;
		this.storeRoom.rooms?.forEach((value, key) => {
			if (!value.isPrivate)
				roomlist.push(key);
		})
		if (!roomlist || !blocklist)
			return null;	//null? or throw Error?
		return (this.makeRoomInfo(blocklist, roomlist));
	}

	getUserRoomList(userId: number): roomInfo[] | null {
		const thisUser = this.storeUser.findUserById(userId);
		if (!thisUser)
			return null;	//null? or throw Error?
		return (this.makeRoomInfo(thisUser.blocklist, thisUser.joinlist));
	}


	//TODO : 여기도 최근 메세지! <- 그러려면? blockList있어야 됨
	getQueryRoomList(userId: number, query: string | null): roomInfo[] | null {
		if (query === null || query.length === 0)
			return ([]);
		const thisUser = this.storeUser.findUserById(userId);
		const roomlist = this.storeRoom.findQueryMatchRoomNames(query);
		if (!thisUser || !roomlist || roomlist.length === 0)
			return ([]);
		return (this.makeRoomInfo(thisUser.blocklist, roomlist));
	}


	//TODO & CHECK : make DMform MessageFrom 함수 있으면 편하지 않을까
	fetchDM(io: Namespace, client: ChatSocket, target: string, body: string) {
		const from = client.userId;
		const to = this.storeUser.getIdByNickname(target);
		const message = new DM(from, to, body);
		const res = {
			fromId: from,
			from: this.storeUser.getNicknameById(from),
			toId: to,
			body: body,
			at: message.at
		};
		this.storeMessage.saveMessage(message);
		io.to([`$${from}$`, `$${to}$`, `$${to}`]).emit("sendDM", this.storeUser.getNicknameById(to), res);	//if you touch ${} here is going to change the most
	}

	makeDMRoomMessages(client: ChatSocket, to: string): formedMessage[] | null {
		const toId = this.storeUser.getIdByNickname(to);
		const fromUser = this.storeUser.findUserById(client.userId);
		const toUser = this.storeUser.findUserById(toId);
		if (fromUser?.blocklist?.has(toId)) {
			client.emit("sendAlert", "[ Act Error ]", `You already blocked ${to}`)
			return null;
		}
		else if (toUser?.blocklist?.has(client.userId)) {
			//TODO : discuss : 그래도 이건 기능적으로 볼 수 있어야하는거 아닌가...? 차라리 block된 유저라고 해주면 모를까...
			client.emit("sendAlert", "[ Act Error ]", `You are blocked by ${fromUser.nickname}`)
			return null;
		}
		else {
			const msg = this.storeMessage
				.findMessagesForUser(client.userId, toId)
				.map(message => ({
					from: this.storeUser.getNicknameById(message.from),
					fromId: message.from,
					to: this.storeUser.getNicknameById(message.to),
					toId: message.to,
					body: message.body,
					at: message.at
				}));
			return (msg);
		}
	}

	fetchUserToDMRoom(client: ChatSocket, username: string) {
		const DMs = this.makeDMRoomMessages(client, username);
		const targetId = this.storeUser.getIdByNickname(username);
		if (DMs != null) {
			if (client.currRoom !== `$${targetId}`) {
				client.leave(client.currRoom);
				client.join(`$${targetId}$`);
				client.currRoom = `$${targetId}$`;
			}
			client.emit("sendDMRoomInfo", username, DMs);
			if (client.userId !== targetId) {
				const DMRoomMembers = this.makeDMRoomUserInfo(client.userId, targetId);
				client.emit("sendRoomMembers", DMRoomMembers);
			}
			else {
				const DMRoomMembers = this.makeDMRoomUserInfo(client.userId);
				client.emit("sendRoomMembers", DMRoomMembers);
			}
		}
	}

	makeRoomInfo(blocklist: Set<number>, roomlist: string[] | Set<string>): roomInfo[] {
		const res = [];
		roomlist.forEach((room: string) => {
			const message = this.storeRoom.findRoom(room).getLastMessage(blocklist);
			res.push({
				roomname: room,
				lastMessage: message.body	//body만 보내도록
			})
		})
		return res;
	}

	makeRoomUserInfo(roomname: string): userInfo[] {
		const room: Room = this.storeRoom.findRoom(roomname);
		if (!room || room.userlist.size === 0)
			return ([]);
		const userInfo = [];
		room.userlist.forEach((user) => {
			const target: User = this.storeUser.findUserById(user);
			userInfo.push({
				id: user,
				nickname: target.nickname,
				isGaming: target.isGaming
			})
		})
		return (userInfo);
	}

	//Error catch?
	makeDMRoomUserInfo(fromId: number, toId?: number): userInfo[] {
		const fromUser = this.storeUser.findUserById(fromId);
		const userInfo = [];
		if (toId) {
			const toUser = this.storeUser.findUserById(toId);
			userInfo.push({
				id: toUser.id,
				nickname: toUser.nickname,
				isGaming: toUser.isGaming
			})
		}
		userInfo.push({
			id: fromUser.id,
			nickname: fromUser.nickname,
			isGaming: fromUser.isGaming
		})
		console.log(userInfo);
		return (userInfo);
	}

	//
	mappingMessagesUserIdToNickname(messages: Message[]): formedMessage[] {
		const res = [];
		messages.forEach((msg) => {
			res.push({
				fromId: msg.from,
				from: `${this.storeUser.getNicknameById(msg.from)}`,
				body: msg.body,
				at: msg.at
			})
		})
		return (res);
	}

	makeCurrRoomInfo(roomname: string): currRoomInfo {
		const room = this.storeRoom.findRoom(roomname);
		if (!room)
			throw new Error(`[makeCurrRoomInfo] : ${roomname} room is not exist`);
		let owner: string | null;
		if (room.owner === 0)
			owner = null;
		else
			owner = this.storeUser.getNicknameById(room.owner);
		const operatorList = [];
		room.operators.forEach((user) => {
			operatorList.push(this.storeUser.getNicknameById(user));
		})
		const res = {
			roomname: roomname,
			owner: owner,
			operators: operatorList,
			messages: this.mappingMessagesUserIdToNickname(room.messages),
			isPrivate: room.isPrivate,
			isProtected: room.password ? true : false
		}
		return (res)
	}

	//TODO : sendAlert message 분리하려면 이 함수에서 Socket 받아야함!
	//채팅방에서 어떤 행동을 할 때 가능한지 모두 체크 : 권한, 유효성, etc.
	checkActValidity(client: ChatSocket, roomname: string, target: number, act: string): boolean {
		const actor = client.userId;
		if (actor === target) {
			client.emit("sendAlert", "[ ACT ERROR ]", `you can't ${act} yourself`)
			return (false);
		}
		const room = this.storeRoom.findRoom(roomname);
		if (room === undefined) {
			client.emit("sendAlert", "[ ACT ERROR ]", `(${act}) Room does not exist`)
			return (false);
		}
		const user = this.storeUser.findUserById(actor);
		if (user === undefined || !user.joinlist.has(roomname)) {
			client.emit("sendAlert", "[ ACT ERROR ]", `(${act}) invalid Actor`)
			return (false);
		}
		if (!room.isOwner(user.id) && !room.isOperator(user.id)) {
			client.emit("sendAlert", "[ ACT ERROR ]", `You are not authorized to ${act}`)
			return (false);
		}
		const targetName = this.storeUser.getNicknameById(target);
		if (target === 0 || targetName === undefined) {
			client.emit("sendAlert", "[ ACT ERROR ]", `(${act}) Target does not exist`)
			return (false);
		}
		else if (!room.isJoinning(target)) {
			client.emit("sendAlert", "[ ACT ERROR ]", `${targetName} is not joining this room`)
			return (false);
		}
		else if (room.isOwner(target)) {
			client.emit("sendAlert", "[ ACT ERROR ]", `${targetName} is the Owner`)
			return (false);
		}
		else if (room.isOperator(target) && !room.isOwner(actor)) {
			client.emit("sendAlert", "[ ACT ERROR ]", `Only owner can ${act} Operator`)
			return (false);
		}
		return (true);
	}

	//TODO : 되는지 확인 // 이거 쓸건지...? -> 문제없으면 빼자
	async emitEventsToAllSockets(io: Namespace, targetId: number, eventname: string, args1?: any, args2?: any): Promise<void> {
		const sockets = await io.in(`$${targetId}`).fetchSockets();
		sockets.forEach((socket) => {
			socket.emit(eventname, args1, args2);
		})
	}

	//CHECK : 좀 처리가 일관성이 없는게 joinlist도 persistent 하게 할지 말지 안 정해놓고 시작함ㅠ -> 주석 정리시 check
	getAllUserInfo(userId: number): userInfo[] {
		// const blocklist = this.storeUser.findUserById(userId).blocklist;
		const thisUser = this.storeUser.findUserById(Number(userId));
		const blocklist = thisUser.blocklist;
		if (!thisUser || !blocklist) {
			console.log('no data');
			return;
		}
		const users = this.storeUser.findAllUser();
		const res = [];
		users?.forEach((user) => {
			res.push({
				id: user.id,
				nickname: user.nickname,
				isGaming: user.isGaming,
				isConnected: user.connected,
				isBlocked: blocklist.has(user.id) ? true : false
			})
		});
		return (res);
	}

	getUserInfoById(userId: number, targetId: string): userInfo {
		const target = this.storeUser.findUserById(Number(targetId));
		return ({
			id: Number(targetId),
			nickname: target.nickname,
			isGaming: target.isGaming,
			isConnected: target.connected,
			isBlocked: this.storeUser.findUserById(userId).blocklist.has(Number(targetId)) ? true : false
		});
	}

	//currRoomInfo, currRoomMembers가 game쪽에서도 필요하다 이럴수가...
	async userChangeNick(io: Namespace, clientId: number, newNick: string) {
		const user = this.storeUser.findUserById(clientId);
		user.nickname = newNick;
		// console.log("changeNickEvent");
		user.joinlist.forEach((room) => {
			const currRoomInfo = this.makeCurrRoomInfo(room);
			const roomMembers = this.makeRoomUserInfo(room);
			// console.log(JSON.stringify(currRoomInfo));
			// console.log(JSON.stringify(roomMembers));
			io.in(room).emit("sendRoomMembers", roomMembers);
			io.in(room).emit("sendCurrRoomInfo", currRoomInfo);
			console.log(`send change nick event ${newNick} in room ${room}`); 0
		})
		//dm방 update 필요...
		const sockets = await io.in(`$${clientId}$`).fetchSockets()
			.catch((error) => {
				return (error.message);
			});
		sockets.forEach((socket: ChatSocket) => {
			// const DMs = this.makeDMRoomMessages(socket, newNick);
			// socket.emit("sendDMRoomInfo", newNick, DMs);
			this.fetchUserToDMRoom(socket, newNick);
		})
		//본인도 update
		const sockets2 = await io.in(`$${clientId}`).fetchSockets()
			.catch((error) => {
				// throw new InternalServerErrorException()
				return (error.message);
			});
		sockets2.forEach((socket: ChatSocket) => {
			socket.nickname = newNick;
			const isDMRoom = (param: string): boolean => {
				if (param[0] === '$'
					&& param[param.length - 1] === '$'
					&& /^(\d+)$/.test(param.substring(1, param.length - 1)))
					return true;
				else
					return false;
			};
			console.log(socket.currRoom);
			// if (regex.test(sockets.currRoom)){
			if (isDMRoom(socket.currRoom)) {
				const targetId = Number(socket.currRoom.substring(1, socket.currRoom.length - 1));
				const target = this.storeUser.getNicknameById(targetId);
				// const DMs = this.makeDMRoomMessages(socket, target);
				this.fetchUserToDMRoom(socket, target);
			}
			else
				console.log("regex failed");
		})
	}


}
