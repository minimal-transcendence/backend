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
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';

@WebSocketGateway({
	namespace: 'game',
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(GameGateway.name);

  constructor(){}

  @WebSocketServer() io : Namespace;

  async afterInit(): Promise<void>{
		this.logger.log('GAME 웹소켓 서버 초기화 ✅');
  }

  async handleConnection(@ConnectedSocket() client: SocketWithAuth, userId : string, ) {
		const sockets = this.io.sockets;

		this.logger.debug(
			`Game Socket connected with userId: ${client.userId}`
		);

		this.logger.log(`Game Client Connected : ${client.id}`);
		this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)

		this.io.emit('game', `from ${client.userId} ${client.email}`);
  }

  async handleDisconnect(@ConnectedSocket() client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Game Socket disconnected with userId: ${client.userId}`
    );

    this.logger.log(`Game Client Disconnected : ${client.id}`);
    this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)
  }

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }
}
