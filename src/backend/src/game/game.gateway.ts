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
import { GameListItem, GameSocket, KeydownPayload, OneOnOneInvite, OneOnOneAccept } from './types';
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

  private randomMatchQueue: GameSocket[] = [];
  private gameRooms = {};

  constructor(private gameServie: GameService){}

  @WebSocketServer() io : Namespace;

  async afterInit(): Promise<void>{
		this.logger.log('GAME 웹소켓 서버 초기화 ✅');

    // Monitoring finished Game
    setInterval(() => {
      for (let e in this.gameRooms) {
        // console.log("GameRoom:", e);
        if (this.gameRooms[e].gameOver) {
          // todo - Save Game Result in DB

          this.io.to(e).emit('gameOver', {
            room: e,
            winner: this.gameRooms[e].winner,
            loser: this.gameRooms[e].loser
          });

          // Set player status
          this.gameRooms[e].player[0].inGame = false;
          this.gameRooms[e].player[1].inGame = false;

          // Delete GameRoom Instance
          delete this.gameRooms[e];
        }
      }
    }, 1500)
  }

  async handleConnection(@ConnectedSocket() client: GameSocket, userId : string, ) {
		const sockets = this.io.sockets;

    client.inGame = false;
    client.gameList = [];
    //For TEST
    client.userId = "def";
    client.nickname = "def";
    client.email = "def";

		this.logger.debug(
			`Game Socket connected with userId: ${client.userId}`
		);

		this.logger.log(`Game Client Connected : ${client.id}`);
		this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)

		this.io.emit('game', `from ${client.userId} ${client.email}`);
  }

  async handleDisconnect(@ConnectedSocket() client: GameSocket) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Game Socket disconnected with userId: ${client.userId}`
    );

    this.logger.log(`Game Client Disconnected : ${client.id}`);
    this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)
  }

  /*-------------Random Match-----------------------*/

  @SubscribeMessage('randomMatchApply')
  handleRandomMatchApply(client: GameSocket) {
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
        players: [this.randomMatchQueue[0], this.randomMatchQueue[1]],
        level: 1
      });

      this.randomMatchQueue[0].inGame = true;
      this.randomMatchQueue[1].inGame = true;

      // console.log(this.gameRooms);
      console.log(this.gameRooms[roomName].player[0].id);
      console.log(this.gameRooms[roomName].player[1].id);
      // Add Players into Game Room
      this.gameRooms[roomName].player[0].join(roomName);
      this.gameRooms[roomName].player[1].join(roomName);
      // Delete Players from Random Match Queue
      this.randomMatchQueue.splice(0, 2);
      // Ask Match Accept
      this.io.to(roomName).emit('matchStartCheck', roomName);
    }
  }

  @SubscribeMessage('randomMatchCancel')
  handleRandomMatchCancel(client: GameSocket) {
    this.randomMatchQueue = this.randomMatchQueue.filter(item => item !== client);
  }

  /*-------------Match Accept-----------------------*/

  @SubscribeMessage('matchAccept')
  handleAccept(client: GameSocket, roomName: string) {
    // let room: GameRoom = this.gameRooms.find((e) => e.name === roomName)

    let room: GameRoom = this.gameRooms[roomName];

    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, room);

    // if (client.userId === room.playerOne.userId) {
    if (client.id === room.player[0].id) {
      room.playerAccept[0] = true;
    }
    // else if (client.userId === room.playerTwo.userId) {
    else if (client.id === room.player[1].id) {
      room.playerAccept[1] = true;
    }

    // Start Game
    if (room.playerAccept[0] && room.playerAccept[1]) {
      this.gameServie.startGame(this.io, room);
    };
    
  }

  @SubscribeMessage('matchDecline')
  handleDecline(client: GameSocket, roomName:string) {
    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, this.gameRooms[roomName]);

    this.io.to(roomName).emit('matchDecline', roomName);
    // delete game room
    delete this.gameRooms[roomName];
  }

  // Test - stop setInterval
  @SubscribeMessage('stopInterval')
  handleStopInterval(client: GameSocket, roomName: string) {
    let room = this.gameRooms[roomName];

    clearInterval(room.interval);
    console.log(`${roomName} stopped`);
  }
  /*---------------------One on One-----------------------------------*/
  @SubscribeMessage('oneOnOneApply')
  handleOneOnOneApply(client: GameSocket, payload: OneOnOneInvite) {
    // Get By Nickname
    // let toClient: GameSocket = this.gameServie.getSocketByNickname(this.io, payload.to);

    // Get By Id - TEST
    // const toClient: GameSocket = this.io.sockets.get(payload.to);
    let toClient: GameSocket;

    this.io.sockets.forEach((e) => {
      if (e.id === payload.to) {
        toClient = e as GameSocket;
      }
    })
    ////////////////////////

    if (!toClient) {
      return `ERR no such user: ${payload.to}`;
    }

    // Invitation (nickname)
    // const invitation: GameListItem = {
    //   from: client.nickname,
    //   to: payload.to,
    //   level: payload.level,
    // }

    // Invitation (id) - TEST
    const invitation: GameListItem = {
      from: client.id,
      to: payload.to,
      level: payload.level,
    }

    // 중복확인
    for (let e in client.gameList) {
      console.log(e);
      console.log(invitation);
      if (this.gameServie.objectsAreSame(client.gameList[e], invitation)) {
        return `ERR aleady invite ${payload.to}`;
      }
    }

    // update list on each client
    client.gameList.push(invitation);
    toClient.gameList.push(invitation);

    // send invitation list
    client.emit('updateGameList', client.gameList);
    toClient.emit('updateGameList', toClient.gameList);

    console.log(`${client.id} - list size: ${client.gameList.length}`);
    console.log(`${toClient.id} - list size: ${toClient.gameList.length}`);
  }

  @SubscribeMessage('oneOnOneAccept')
  handleOneOnOneAccept(client: GameSocket, payload: OneOnOneAccept) {
    for (let e in client.gameList) {
      if (client.gameList[e].from === payload.from) {
        // Get By Nickname
        // const fromClient: GameSocket = this.gameServie.getSocketByNickname(this.io, payload.from);

        // Get By Id - TEST
        // const toClient: GameSocket = this.io.sockets.get(payload.to);
        let fromClient: GameSocket;

        this.io.sockets.forEach((e) => {
          if (e.id === payload.from) {
            fromClient = e as GameSocket;
          }
        })
        ////////////////////////

        if (!fromClient) {
          return `ERR no such user: ${payload.from}`;
        }

        // Create New Game Room
        const roomName = "room_" + fromClient.id;
        this.gameRooms[roomName] = new GameRoom({
          name: roomName,
          players: [fromClient, client],
          level: payload.level
        });

        fromClient.inGame = true;
        client.inGame = true;

        // Add Players into Game Room
        fromClient.join(roomName);
        client.join(roomName);

        console.log(this.gameRooms[roomName].player[0].id);
        console.log(this.gameRooms[roomName].player[1].id);

        // Delete Invitations from each user

        // Invitation (nickname)
        // const invitation: GameListItem = {
        //   from: fromClient.nickname,
        //   to: client.nickname,
        //   level: payload.level,
        // }

        // Invitation (id) - TEST
        const invitation: GameListItem = {
          from: fromClient.id,
          to: client.id,
          level: payload.level
        }

        fromClient.gameList = fromClient.gameList.filter(item => 
          !this.gameServie.objectsAreSame(item, invitation));
        client.gameList = client.gameList.filter(item => 
          !this.gameServie.objectsAreSame(item, invitation));

        // Ask Match Accept
        this.io.to(roomName).emit('matchStartCheck', roomName);

        console.log(`${fromClient.id} - list size: ${fromClient.gameList.length}`);
        console.log(`${client.id} - list size: ${client.gameList.length}`);
        
        return;
      }
    }
    return `ERR no invitation from ${payload.from}`;
  }

  /*---------------------In Game--------------------------------------*/

  // In Game
  @SubscribeMessage('keydown')
  handleKeydown(client: GameSocket, payload: KeydownPayload) {
    // client is not in game
    if (!client.inGame) {
      return;
    }

    // check if user in the room
    this.gameServie.validatePlayerInRoom(client, this.gameRooms[payload.roomName]);

    let room = this.gameRooms[payload.roomName];

    switch (payload.key) {
      case 'ArrowLeft':
        if (client === room.player[0]) {
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
        if (client === room.player[0]) {
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
  /*-----------------------------------------------------------*/
}