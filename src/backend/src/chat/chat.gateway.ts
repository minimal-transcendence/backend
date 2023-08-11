import { Logger, UseGuards, Req } from '@nestjs/common';
import {
	ConnectedSocket,
	// MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	// SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { ChatRoomStoreService, Room } from './store/store.room.service';
import { ChatUserStoreService, User } from './store/store.user.service';
// import { Message } from './store/store.message.service';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

//TODO : 아직 인증 처리가 완전하지 않아서 새로고침을 했을 때, 혹은 jwtToken이 만료 되었을때... 같은 유저가 하나는 user99, 하나는 null로 찍힌다ㅠ 인증이 정상적으로 이루어지고 나서도 이렇게 되는지 확인할 것
@UseGuards(JwtGuard)	//guard해도 연결 자체가 막히지는 않는 듯... ㄸㄹㄹ
@WebSocketGateway(3002, {
	pingInterval : 5000,
	pingTimeout : 3000,
})
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	constructor(
		private storeRoom : ChatRoomStoreService,
		private storeUser : ChatUserStoreService,
		// private storeMessage : ChatMessageStoreService,
		private chatService : ChatService,
		private prisma : PrismaService,
		private jwtService : JwtService,
	){}
	
	@WebSocketServer() 
	server : Server;
	private logger: Logger = new Logger('EventsGateway');

	//아니면 여기서 prisma 써서 userlist 다 가져오게 할까...?
	//여기서 async써도 괜찮은가...?
	//TODO : 아니 생각해보니.... 이거 validation 어떻게...?
	async afterInit(){
		this.logger.log('웹소켓 서버 초기화 ✅');

		//DB의 모든 유저를 등록한다
		const users = await this.prisma.user.findMany({
			select : { 
				id : true,
				nickname : true
			}
		});
		users.forEach((user) => {
			this.storeUser.saveUser(
				user.id, 
				new User(user.id, user.nickname)
			);
		})
		this.storeUser.saveUser(-1, new User(-1, "Server_Admin"));
		this.storeRoom.saveRoom("DEFAULT", new Room(-1));	//owner id = -1 as server
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client Connected : ${client.id}`);
		
		console.log(this.storeUser.findAllUser());
		const userId = await this.chatService.clientAuthentification(client);
		client.data.id = userId;
		
		console.log("new connection");
		const thisUser = this.storeUser.findUserById(userId);
		console.log(`found user : ${JSON.stringify(thisUser)}`);
		console.log(client.id);

		//유저가 원래 DB에 있던 유저가 아니면 추가
		//그 default room과 dm room에 각각 join후 필요한 정보 emit(각 소켓 별)
		await this.chatService.newUserConnected(this.server, client, userId, this.storeUser.getNicknameById(userId));
		
		// client.on("sendChatMessage", (to, body) => {})
		this.chatService.sendChat(this.server, client, "DEFAULT", "I'm coming");
		this.chatService.makeCurrRoomInfo("DEFAULT");

		//client.on("sendRoomPass", (room, password) => {})
		//client.on("sendRoomLeave", (room) => {})
		//client.on("selectRoom", (room) => {})
		//client.on("blockUser", (user) => {})	//의논 요
		//client.on("kickUser", (roomname, user) => {})
		//client.on("muteUser", (roomname, user) => {})
		//client.on("banUser", (roomname, user) => {})
		//client.on("addOperator", (roomname, user) => {})
		//client.on("deleteOperator", (roomname, user) => {})
		//client.on("requestAllRoomList", () => {})
		//client.on("requestMyRoomList", () => {})
		//client.on("requestSearchResultRoomList", (query) => {})
		//client.on("requestRoomMembers", (roomname) => {})
		
		//client.on("changeNick", (newNick) => {})
		//client.on("sendDirectMessage", (to, body) => {})

	}

	//disconnecting, disconnect 둘다 감지 가능?
	async handleDisconnect(@ConnectedSocket() client: Socket) {
		
	}
}
