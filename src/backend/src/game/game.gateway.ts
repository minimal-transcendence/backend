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
import { SocketWithAuth } from 'src/chat/types';
import { GameRoom } from './GameRoom';
import { GameService } from './game.service';

// let readyPlayerCount: number = 0;

@WebSocketGateway({
	namespace: 'game',
  pingTimeout: 2000,
  pingInterval: 5000,
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(GameGateway.name);
  // private room: string = "";
  // private readyPlayerCount: number = 0;

  private randomMatchQueue: SocketWithAuth[] = [];
  private gameRooms = {};

  constructor(private gameServie: GameService){}

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

  // @SubscribeMessage('ready')
  // handleReady(client: SocketWithAuth) {
  //   this.room = "room" + Math.floor(this.readyPlayerCount / 2);
  //   client.join(this.room);

  //   console.log("Player ready :", client.id, this.room);

  //   this.readyPlayerCount++;

  //   console.log("readyPlayCount : ", this.readyPlayerCount);

  //   if (this.readyPlayerCount % 2 === 0) {
  //     this.io.in(this.room).emit("startGame", client.id);
  //   }
  // }

  // @SubscribeMessage('paddleMove')
  // handlePaddleMove(client: SocketWithAuth, payload: any) {
  //   this.io.to(this.room).emit("paddleMove", payload);
  // }

  // @SubscribeMessage('ballMove')
  // handleBallMove(client: SocketWithAuth, payload: any) {
  //   this.io.to(this.room).emit("ballMove", payload);
  //   // console.log(payload);
  // }

  @SubscribeMessage('randomMatchApply')
  handleRandomMatchApply(client: SocketWithAuth) {
    // client is in game
    if (client.inGame) {
      return;
    }

    // remove duplication
    if (this.randomMatchQueue.includes(client)) {
      return;
    }
    
    // push client in queue
    this.randomMatchQueue.push(client);

    // More than 2 players in queue
    if (this.randomMatchQueue.length >= 2) {
      // Create New Game Room
      const roomName = "room_" + this.randomMatchQueue[0].id;
      this.gameRooms[roomName] = new GameRoom({
        name: roomName,
        playerOne: this.randomMatchQueue[0],
        playerTwo: this.randomMatchQueue[1]
      });

      this.randomMatchQueue[0].inGame = true;
      this.randomMatchQueue[1].inGame = true;

      // console.log(this.gameRooms);
      console.log(this.gameRooms[roomName].playerOne.id);
      console.log(this.gameRooms[roomName].playerTwo.id);
      // Add Players into Game Room
      this.gameRooms[roomName].playerOne.join(roomName);
      this.gameRooms[roomName].playerTwo.join(roomName);
      // Delete Players from Random Match Queue
      this.randomMatchQueue.splice(0, 2);
      // Ask Match Accept
      this.io.to(roomName).emit('randomMatchStartCheck', roomName);
    }
  }

  @SubscribeMessage('randomMatchCancel')
  handleRandomMatchCancel(client: SocketWithAuth) {
    this.randomMatchQueue = this.randomMatchQueue.filter(item => item !== client);
  }

  @SubscribeMessage('randomMatchAccept')
  handleAccept(client: SocketWithAuth, roomName: string) {
    // let room: GameRoom = this.gameRooms.find((e) => e.name === roomName)

    let room: GameRoom = this.gameRooms[roomName];

    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, room);

    // if (client.userId === room.playerOne.userId) {
    if (client.id === room.playerOne.id) {
      room.playerOneAccept = true;
    }
    // else if (client.userId === room.playerTwo.userId) {
    else if (client.id === room.playerTwo.id) {
      room.playerTwoAccept = true;
    }

    // Start Game
    if (room.playerOneAccept && room.playerTwoAccept) {

      // send game data for Init
      this.io.to(roomName).emit('startGame', {
        roomName: room.name,
        canvasWidth: room.canvasWidth,
        canvasHeight: room.canvasHeight,
        paddleWidth: room.paddleWidth,
        paddleHeight: room.paddleHeight,
        paddleX: room.paddleX,
        ballX: room.ballX,
        ballY: room.ballY,
        ballRadius: room.ballRadius,
      });

      // setInterval
      room.interval = setInterval(() => {
        this.gameServie.ballMove(room);

        // send game data for drawing
        this.io.to(roomName).emit('gameData', {
          roomName: room.name,
          ballX: room.ballX,
          ballY: room.ballY,
          paddleX: room.paddleX
        });
      }, 1000);
    };
    
  }

  // Test - stop setInterval
  @SubscribeMessage('stopInterval')
  handleStopInterval(client: SocketWithAuth, roomName: string) {
    let room = this.gameRooms[roomName];

    clearInterval(room.interval);
    console.log(`${roomName} stopped`);
  }

  @SubscribeMessage('randomMatchDecline')
  handleDecline(client: SocketWithAuth, roomName:string) {
    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, this.gameRooms[roomName]);

    this.io.to(roomName).emit('gameDeclined', roomName);
    // delete game room
    delete this.gameRooms[roomName];
  }

  // In Game
  @SubscribeMessage('keydown')
  handleKeydown(client: SocketWithAuth, payload: any) {
    // client is not in game
    if (!client.inGame) {
      return;
    }

    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, this.gameRooms[payload.roomName]);

    let room = this.gameRooms[payload.roomName];

    switch (payload.key) {
      case 'ArrowLeft':
        if (client === room.playerOne) {
          room.paddleX[0] -= 15;
          if (room.paddleX[0] <= 0) {
            room.paddleX[0] = 0;
          }
        }
        else {
          room.paddleX[1] -= 15;
          if (room.paddleX[1] <= 0) {
            room.paddleX[1] = 0;
          }
        }
        break;
      case 'ArrowRight':
        if (client === room.playerOne) {
          room.paddleX[0] += 15;
          if (room.paddleX[0] >= room.canvasWidth - room.paddleWidth) {
            room.paddleX[0] = room.canvasWidth - room.paddleWidth;
          }
        }
        else {
          room.paddleX[1] += 15;
          if (room.paddleX[1] >= room.canvasWidth - room.paddleWidth) {
            room.paddleX[1] = room.canvasWidth - room.paddleWidth;
          }
        }
        break;
    }
  }

  // @SubscribeMessage('keydown')
  // handleKeydown(client: SocketWithAuth, roomName: string, key: string) {
  //   // client is not in game
  //   if (!client.inGame) {
  //     return;
  //   }
  //   // check if user in the room
  //   this.gameServie.validatePlayerInRoom(client, this.gameRooms[roomName]);

  //   switch (key) {
  //     case 'ArrowLeft':
  //       if (client === this.gameRooms[roomName].playerOne) {
  //         this.gameRooms[roomName].paddleX[0] -= 15;
  //       }
  //       else {
  //         this.gameRooms[roomName].paddleX[1] -= 15;
  //       }
  //       break;
  //     case 'ArrowRight':
  //       if (client === this.gameRooms[roomName].playerOne) {
  //         this.gameRooms[roomName].paddleX[0] += 15;
  //       }
  //       else {
  //         this.gameRooms[roomName].paddleX[1] += 15;
  //       }
  //       break;
  //   }
  // }
}