import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatSocket } from './types';

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

		//TODO : erase loggers?
	async handleConnection(@ConnectedSocket() client: ChatSocket) {
		// const sockets = this.io.sockets;
    // this.logger.debug(`Number of connection in Chat namespace : ${sockets.size}`);
    this.logger.log(`Client Connected : ${client.id}, ${client.userId}`);
	
		client.onAny((any : any) => {
			this.logger.log(`client ${client.nickname} send event : ${any}`);
		})

		this.chatService.handleNewConnection(this.io, client);
		
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
			this.chatService.userLeaveRoom(this.io, client, room);
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
      const roomInfo = this.chatService.getQueryRoomList(client.userId, query);
      client.emit('responseRoomQuery', roomInfo);
    });

    client.on('requestRoomMembers', (roomname) => {
      const roomMembers = this.chatService.makeRoomUserInfo(roomname);
      client.emit('sendRoomMembers', roomMembers);
    });

    client.on('requestAllMembers', () => {
      const members = this.chatService.getAllUserInfo();
      client.emit('responseAllMembers', members);
    })

    client.on('selectDMRoom', (username) => {
      this.chatService.fetchUserTODMRoom(client, username);
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
    await this.chatService.handleDisconnection(this.io, client);
  }

	updateUserNick(userId : number, newNick : string) {
		this.io.emit("updateUserNick", userId, newNick);
    this.chatService.userChangeNick(this.io, userId, newNick);
	}

	updateUserAvatar(userId : number){
		this.io.emit("updateUserAvatar", userId);
	}

  //check handleDisconnect
  logout(clientId : number) {
    this.io.in(`$${clientId}`).disconnectSockets(true); //false?
  }
}
