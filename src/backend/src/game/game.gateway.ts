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

// let readyPlayerCount: number = 0;

@WebSocketGateway({
	namespace: 'game',
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(GameGateway.name);
  private room: string = "";
  private readyPlayerCount: number = 0;

  constructor(){
    
  }

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

  @SubscribeMessage('ready')
  handleReady(client: SocketWithAuth) {
    this.room = "room" + Math.floor(this.readyPlayerCount / 2);
    client.join(this.room);

    console.log("Player ready :", client.id, this.room);

    this.readyPlayerCount++;

    console.log("readyPlayCount : ", this.readyPlayerCount);

    if (this.readyPlayerCount % 2 === 0) {
      this.io.in(this.room).emit("startGame", client.id);
    }
  }

  @SubscribeMessage('paddleMove')
  handlePaddleMove(client: SocketWithAuth, payload: any) {
    this.io.to(this.room).emit("paddleMove", payload);
  }

  @SubscribeMessage('ballMove')
  handleBallMove(client: SocketWithAuth, payload: any) {
    this.io.to(this.room).emit("ballMove", payload);
  }
}
