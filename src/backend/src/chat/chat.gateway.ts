import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatSocket } from './types';
// import { chatSocket } from './dto/validation-form';
import { CustomWebSocketGuard, RoomName, VarId, VarId2 } from './chat.decorator';

@WebSocketGateway({
	namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() io : Namespace;
	private readonly logger = new Logger(ChatGateway.name);
	constructor(
		private chatService: ChatService,
	) {}

	async afterInit(){
		await this.chatService.initChatServer();	//
	}


	async handleConnection(@ConnectedSocket() client: ChatSocket) {
		this.logger.log(`Client Connected : ${client.id}, ${client.userId}`);
	
		//TODO : erase
		client.onAny((any : any) => {
			this.logger.log(`accept event : ${any}`);
		})

		this.chatService.newConnection(this.io, client);
		
		// client.on("check", (a : any, b : any, c: any) => {
		// 	// console.log(a, " ", b, " hihi ", c);
		// 	// console.log(a.toString, parseInt(b), parseInt(c));
		// })

		client.on("sendChatMessage", (to, body) => {
			this.chatService.sendChat(this.io, client, to, body);
		});

		client.on("selectRoom", (room) => {
			this.chatService.userJoinRoom(this.io, client, room);
		});

		client.on("sendRoomPass", (room, password) => {
			this.chatService.userJoinRoom(this.io, client, room, password);
		});

		client.on("setRoomPass", (room, password) => {
			this.chatService.setPassword(this.io, client, room, password);
		})

		//TODO : 미완성
		client.on("sendRoomLeave", (room) => {
			this.chatService.userLeaveRoom(this.io, client.userId, room);
			this.chatService.userLeaveRoomAct(this.io, client.userId, room);
		});

    //TODO : check
    client.on('blockUser', (user) => {
      this.chatService.blockUser(this.io, client, user);
    });

    client.on('unblockUser', (user) => {
      this.chatService.unblockUser(this.io, client, user);
    });

    client.on('kickUser', (roomname, user) => {
        this.chatService.kickUser(this.io, client, roomname, user);
    });

    client.on('banUser', (roomname, user) => {
		this.chatService.banUser(this.io, client, roomname, user);
    });

    client.on('muteUser', (roomname, user) => {
        this.chatService.muteUser(this.io, client, roomname, user);
    });

    client.on('addOperator', (roomname, user) => {
		this.chatService.addOperator(this.io, client, roomname, user);
	});

    client.on('deleteOperator', (roomname, user) => {
		this.chatService.deleteOperator(this.io, client, roomname, user);
    });

    client.on('requestAllRoomList', () => {
      const roomInfo = this.chatService.getAllRoomList(client.userId);
      client.emit('sendRoomList', roomInfo);
    });

    client.on('requestMyRoomList', () => {
      const roomInfo = this.chatService.getUserRoomList(client.userId);
	  client.emit('sendRoomList', roomInfo);
    });

    client.on('requestSearchResultRoomList', (query) => {
      const roomInfo = this.chatService.getQueryRoomList(query);
      client.emit('responseRoomQuery', roomInfo);
    });

    client.on('requestRoomMembers', (roomname) => {
      const roomMembers = this.chatService.makeRoomUserInfo(roomname);
      client.emit('sendRoomMembers', roomMembers);
    });

    //여기 뭔가 event emit이 필요한지 의논할 것...
    //sendAlert 외에 말이다...
    // client.on('changeNick', (newNick) => {
    //   const user = this.storeUser.findUserById(client.userId);
    //   user.nickname = newNick; //중복 확인은 여기서 하지 않는다... db에서 한다...
    //   client.emit(
    //     'sendAlert',
    //     'Nickname Changed',
    //     'your nickname has successfully changed!',
    //   );
    // });

    client.on('selectDMRoom', (username) => {
      const DMs = this.chatService.makeDMRoomMessages(
        client.nickname,
        username,
      );
      this.chatService.emitEventsToAllSockets(
        this.io,
        client.userId,
        'sendDMRoomInfo',
        username,
        DMs,
      );
    });

    client.on('sendDirectMessage', (to, body) => {
      this.chatService.fetchDM(this.io, client, to, body);
    });

	client.on('setRoomPrivate', (roomname) => {
		this.chatService.setRoomStatus(this.io, client, roomname, true);
	})

	client.on('setRoomPublic', (roomname) => {
		this.chatService.setRoomStatus(this.io, client, roomname, false);
	})
  }


  //disconnecting, disconnect 둘다 감지 가능?
  async handleDisconnect(@ConnectedSocket() client: ChatSocket) {
    this.logger.log(client.nickname + 'is leaving');
    await this.chatService.disconnectUser(this.io, client.userId);
  }

	userUpdateNick(userId : number, newNick : string) {
		this.io.emit("updateUserNick", userId, newNick);
	}

	userUpdateAvatar(userId : number){
		this.io.emit("updateUserAvatar", userId);
	}

	userUpdateStatus(userId : number, isConnected : boolean){
		this.io.emit("updateUserStatus", userId, isConnected);
	}
	// validation is not working
	// validation limitation : can't catch redundant incomings
	// handleCheck(client: ChatSocket, @Body(ParseIntPipe) data : number)
	// @SubscribeMessage('check')
	// handleCheck(client : ChatSocket, data1 : any, data2 : any){
	// 	console.log(data1, data2);
	// }
	// @UseGuards(CustomWebSocketGuard) 
	@SubscribeMessage('check')
	handleCheck(
		@RoomName() data1 : ChatSocket, 
		@VarId() data2 : number,
		){
		// console.log("inside");
		// // console.log(client);
		// console.log("first args");
		// console.log(data1.userId);
		// console.log("second args");
		// console.log(data2);
	}
}
