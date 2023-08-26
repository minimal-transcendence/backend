import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { ChatRoomStoreService, Room } from '../store/store.room.service';
import { ChatUserStoreService, User } from '../store/store.user.service';
import { DM, ChatMessageStoreService } from '../store/store.message.service';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma.service';
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
		this.chatService.initChatServer();
	}


	async handleConnection(@ConnectedSocket() client: ChatSocket) {
		this.logger.log(`Client Connected : ${client.id}, ${client.userId}`);
	
		//TODO : erase
		client.onAny((any : any) => {
			this.logger.log(`accept event : ${any}`);
		})

		await this.chatService.newConnection(this.io, client);
		
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
			this.chatService.userLeaveRoom(this.io, client.data.id, room);
			this.chatService.userLeaveRoomAct(this.io, client.data.id, room);
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
      const roomInfo = this.chatService.getAllRoomList(client.data.id);
      client.emit('sendRoomList', roomInfo);
    });

    client.on('requestMyRoomList', () => {
      const roomInfo = this.chatService.getUserRoomList(client.data.id);
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
    //   const user = this.storeUser.findUserById(client.data.id);
    //   user.nickname = newNick; //중복 확인은 여기서 하지 않는다... db에서 한다...
    //   client.emit(
    //     'sendAlert',
    //     'Nickname Changed',
    //     'your nickname has successfully changed!',
    //   );
    // });

    client.on('selectDMRoom', (username) => {
      const DMs = this.chatService.makeDMRoomMessages(
        client.data.nickname,
        username,
      );
      this.chatService.emitEventsToAllSockets(
        this.io,
        client.data.id,
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
    await this.chatService.disconnectUser(this.io, client.data.id);
  }

	userUpdateNick(userId : number, newNick : string) {
		// this.chatService.userChangeNick()
		this.io.emit("updateUserNick", userId, newNick);
	}

	userUpdateAvatar(userId : number){
		this.io.emit("updateUserAvatar", userId);
	}

	userUpdateStatus(userId : number, isConnected : boolean){
		this.io.emit("updateUserStatus", userId, isConnected);
	}
}
