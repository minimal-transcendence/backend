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

@WebSocketGateway({
	namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	@WebSocketServer() io : Namespace;
	private readonly logger = new Logger(ChatGateway.name);
	constructor(private chatService: ChatService) {}

	userUpdateNick(userId : number, newNick : string) {
		this.io.emit("updateUserNick", userId, newNick);
	}

	userUpdateAvatar(userId : number){
		this.io.emit("updateUserAvatar", userId);
	}

	afterInit(){
		this.chatService.initChatServer();	//
	}

	handleConnection(@ConnectedSocket() client: ChatSocket) {
	    this.logger.log(`Client Connected : ${client.id}, ${client.userId}`);
	
		client.onAny((any : any) => {
			this.logger.log(`client ${client.nickname} send event : ${any}`);
		})

		this.chatService.handleNewConnection(this.io, client);
	}


	async handleDisconnect(@ConnectedSocket() client: ChatSocket) {
		this.logger.log(client.nickname + 'is leaving');
		await this.chatService.handleDisconnection(this.io, client);
	}


	@SubscribeMessage('sendChatMessage')
	handleSendChat(client: ChatSocket, payload : any){
		this.chatService.sendChat(
			this.io,
			client,
			payload[0],
			payload[1]
		);
	}

}
