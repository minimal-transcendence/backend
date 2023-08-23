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
import { 
	Invitation,
  	GameSocket,
  	KeydownPayload
} from './types';
import { GameRoom } from './GameRoom';
import { GameService } from './game.service';
import { MatchService } from 'src/match/match.service';

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
	private randomMatchQueue = {
		easy: [],
		normal: [],
		hard: []
	}
	private gameRooms = {};

	constructor(
		private gameService: GameService,
		private matchService: MatchService
	){}

	@WebSocketServer()
	io : Namespace;

	afterInit(){
		this.logger.log('GAME 웹소켓 서버 초기화 ✅');

		// Monitoring finished Game - clear game room instance
		setInterval(() => {
			for (let e in this.gameRooms) {
				console.log("GameRoom:", e);
				if (this.gameRooms[e].gameOver) {
				const room: GameRoom = this.gameRooms[e];
				if (room.gameStart) {
					// Save Game Result in DB
					this.matchService.createMatchHistory({
						winnerId: parseInt(room.winner.userId),
						loserId: parseInt(room.loser.userId)
					})
					this.io.to(e).emit('gameOver', {
					roomName: e,
					winner: room.winner.nickname,
					loser: room.loser.nickname
					});
				}

				// Set player status
				if (room.player[0]) {
					room.player[0].inGame = false;
				}
				if (room.player[1]) {
					room.player[1].inGame = false;
				}

				// Delete GameRoom Instance
				delete this.gameRooms[e];
				}
			}
		}, 1500)
	}

	handleConnection(@ConnectedSocket() client: GameSocket, userId : string, ) {

		client.inGame = false;
		client.invitationList = [];

		const sockets = this.io.sockets;
		this.logger.log(`Game Client Connected : ${client.nickname}`);
		this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)
  }

	handleDisconnect(@ConnectedSocket() client: GameSocket) {
		// leave game
		if (client.inGame) {
			for (let e in this.gameRooms) {
				const room: GameRoom = this.gameRooms[e];
				// If client is in game
				if (room.player[0] || room.player[1]) {
					// Set Room Game Over - monitoring interval will emit/clean the room
					room.gameOver = true;
					// if started game
					if (room.gameStart) {
						// Stop Inteval
						clearInterval(room.interval);
						// Set winner
						room.winner = client === room.player[0] ? room.player[1] : room.player[0];
						room.loser = client;

						console.log("-----Game Over-----");
						console.log("Winner:", room.winner.nickname);
						console.log("Loser:", room.loser.nickname);
						console.log("-------Score-------");
						console.log(`${room.playerScore[0]} - ${room.player[0].id}`);
						console.log(`${room.playerScore[1]} - ${room.player[1].id}`);
					} else {
						this.io.to(room.name).emit('matchDecline', room.name);
					}
				}
			}
		}

		const sockets = this.io.sockets;
		this.logger.log(`Game Client Disconnected : ${client.nickname}`);
		this.logger.debug(`Number of connected Game sockets: ${sockets.size}`)
	}

  /*-------------Random Match-----------------------*/

  @SubscribeMessage('randomMatchApply')
  handleRandomMatchApply(client: GameSocket, mode: string) {
    // client is in game
    console.log(mode);
    if (client.inGame) {
      return;
    }

	// if no matched mode, set default mode to normal
	if (!mode || (mode !== "easy" && mode !== "normal" && mode !== "hard")) {
		mode = "normal";
		console.log(`mode set to default: ${mode}`);
	}

    // set random match queue
	let matchQueue: GameSocket[] = this.randomMatchQueue[mode];

    // remove duplication
    if (matchQueue.includes(client)) {
      return;
    }

	// delete client from other random match queue
	for (let e in this.randomMatchQueue) {
		if (e !== mode) {
			this.randomMatchQueue[e] = this.randomMatchQueue[e].filter(item => item !== client);
		}
	}

    // push client in queue
    matchQueue.push(client);

	console.log(this.randomMatchQueue["easy"].length);
	console.log(this.randomMatchQueue["normal"].length);
	console.log(this.randomMatchQueue["hard"].length);

    // More than 2 players in queue
    if (matchQueue.length >= 2) {
      let playerOne = matchQueue[0];
      let playerTwo = matchQueue[1];
      // if player aleady is in game
      // delete player from queue
      if (playerOne.inGame) {
        matchQueue =
          matchQueue.filter(item => item !== playerOne);
        return;
      }
      if (playerTwo.inGame) {
        matchQueue =
          matchQueue.filter(item => item !== playerTwo);
        return;
      }
      // Create New Game Room
      const roomName = `room_${playerOne.nickname}_${playerTwo.nickname}`;
      this.gameRooms[roomName] = new GameRoom({
        name: roomName,
        player: [playerOne, playerTwo],
        mode: mode
      });

      playerOne.inGame = true;
      playerTwo.inGame = true;

      console.log("create game room:", roomName);

      // Add Players into Game Room
      playerOne.join(roomName);
      playerTwo.join(roomName);
      // Delete Players from Random Match Queue
      matchQueue.splice(0, 2);
      // Ask Match Accept
      this.io.to(roomName).emit('matchStartCheck', {
        roomName: roomName,
        player: [playerOne.nickname, playerTwo.nickname],
        mode: mode
      });
    }
  }

  @SubscribeMessage('randomMatchCancel')
  handleRandomMatchCancel(client: GameSocket) {
	for (const e in this.randomMatchQueue) {
		this.randomMatchQueue[e] = this.randomMatchQueue[e].filter(item => item !== client);
	}

	console.log(this.randomMatchQueue["easy"].length);
	console.log(this.randomMatchQueue["normal"].length);
	console.log(this.randomMatchQueue["hard"].length);
  }

  /*-------------Match Accept-----------------------*/

  @SubscribeMessage('matchAccept')
  handleAccept(client: GameSocket, roomName: string) {
    let room: GameRoom = this.gameRooms[roomName];

    // check if user in the room
    this.gameService.validatePlayerInRoom(client, room);

    if (client.id === room.player[0].id) {
      room.playerAccept[0] = true;
    }
    else if (client.id === room.player[1].id) {
      room.playerAccept[1] = true;
    }

    // Start Game
    if (room.playerAccept[0] && room.playerAccept[1]) {
      this.gameService.startGame(this.io, room);
    };
    
  }

  @SubscribeMessage('matchDecline')
  handleDecline(client: GameSocket, roomName:string) {
    // check if user in the room
    this.gameService.validatePlayerInRoom(client, this.gameRooms[roomName]);

    this.gameRooms[roomName].player[0].inGame = false;
    this.gameRooms[roomName].player[1].inGame = false;

    this.io.to(roomName).emit('matchDecline', roomName);
    // delete game room
    delete this.gameRooms[roomName];
  }

  /*---------------------One on One-----------------------------------*/

  @SubscribeMessage('oneOnOneApply')
  handleOneOnOneApply(client: GameSocket, payload: Invitation) {
	console.log(payload.to);
    // Get By Nickname
    const toClient: GameSocket = this.gameService.getSocketByNickname(this.io, payload.to);

    if (!toClient) {
      return `ERR no such user: ${payload.to}`;
    }

    // 중복확인
    for (let e in client.invitationList) {
      if (this.gameService.objectsAreSame(client.invitationList[e], payload)) {
        return `ERR aleady invite ${payload.to}`;
      }
    }

    // update list on each client
    client.invitationList.push(payload);
    toClient.invitationList.push(payload);

    // send invitation list
    client.emit('updateInvitationList', client.invitationList);
    toClient.emit('updateInvitationList', toClient.invitationList);

    console.log(`${client.nickname} - list size: ${client.invitationList.length}`);
    console.log(`${toClient.nickname} - list size: ${toClient.invitationList.length}`);
  }

  @SubscribeMessage('oneOnOneAccept')
  handleOneOnOneAccept(client: GameSocket, payload: Invitation) {
    for (let e in client.invitationList) {
      if (client.invitationList[e].from === payload.from) {
		// delete invitation from client
		client.invitationList = client.invitationList.filter((item: Invitation) => 
		!this.gameService.objectsAreSame(item, payload));
		// send invitation list to client
		client.emit('updateInvitationList', client.invitationList);

        // Get By Nickname
        const fromClient: GameSocket = this.gameService.getSocketByNickname(this.io, payload.from);

        if (!fromClient) {
          return `ERR no such user: ${payload.from}`;
        }

        if (fromClient.inGame) {
          return `ERR ${payload.from} is in game`;
        }

        // Create New Game Room
        const roomName = `room_${fromClient.nickname}_${client.nickname}`;
        this.gameRooms[roomName] = new GameRoom({
          name: roomName,
          player: [fromClient, client],
          mode: payload.mode
        });

        fromClient.inGame = true;
        client.inGame = true;

        // Add Players into Game Room
        fromClient.join(roomName);
        client.join(roomName);

        console.log("create game room:", roomName);

        // Delete Invitations from fromClient
        fromClient.invitationList = fromClient.invitationList.filter((item: Invitation) => 
          !this.gameService.objectsAreSame(item, payload));
		// send invitation list to fromClient
		fromClient.emit('updateInvitationList', fromClient.invitationList);

        // Ask Match Accept
        this.io.to(roomName).emit('matchStartCheck', {
          roomName: roomName,
          player: [fromClient.nickname, client.nickname],
          mode: payload.mode
        });

        console.log(`${fromClient.id} - list size: ${fromClient.invitationList.length}`);
        console.log(`${client.id} - list size: ${client.invitationList.length}`);
        
        return;
      }
    }
    return `ERR no invitation from ${payload.from}`;
  }

  @SubscribeMessage('oneOnOneDecline')
  handleOneOnOneDecline(client: GameSocket, payload: Invitation) {
	// delete invitation from client
	client.invitationList = client.invitationList.filter((item: Invitation) => 
		!this.gameService.objectsAreSame(item, payload));
	// emit updated list
	client.emit('updateInvitationList', client.invitationList);

	// Get another player socket by nickname
    const fromClient: GameSocket = this.gameService.getSocketByNickname(this.io, payload.to);
	if (fromClient) {
		// delete invitation from client
		fromClient.invitationList = fromClient.invitationList.filter((item: Invitation) => 
		!this.gameService.objectsAreSame(item, payload));
		// emit updated list
		fromClient.emit('updateInvitationList', fromClient.invitationList);
	}
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
    this.gameService.validatePlayerInRoom(client, this.gameRooms[payload.roomName]);

    let room = this.gameRooms[payload.roomName];

    switch (payload.key) {
      case 'ArrowLeft':
        if (client === room.player[0]) {
          room.paddleX[0] -= 7;
          if (room.paddleX[0] <= 0) {
            room.paddleX[0] = 0;
          }
        }
        else {
          room.paddleX[1] -= 7;
          if (room.paddleX[1] <= 0) {
            room.paddleX[1] = 0;
          }
        }
        break;
      case 'ArrowRight':
        if (client === room.player[0]) {
          room.paddleX[0] += 7;
          if (room.paddleX[0] >= room.canvasWidth - room.paddleWidth) {
            room.paddleX[0] = room.canvasWidth - room.paddleWidth;
          }
        }
        else {
          room.paddleX[1] += 7;
          if (room.paddleX[1] >= room.canvasWidth - room.paddleWidth) {
            room.paddleX[1] = room.canvasWidth - room.paddleWidth;
          }
        }
        break;
    }
  }
  /*-----------------------Nickname Changed------------------------------*/
  @SubscribeMessage('changeNick')
  handleNicknameChanged(client: GameSocket, nickname: string) {
	const sockets = this.io.sockets;
	const oldNickname = client.nickname;

	/*
	얕은 복사가 이뤄졌기 때문에 Invitation 객체가 수정되면 이 객체를 가지고 있는 다른 invitationList도 값이 변경됨.
	=> 주소값을 공유하고 있는 형태
	*/
	client.invitationList.forEach((invit: Invitation) => {
		if (invit.from === oldNickname) {
			invit.from = nickname;
		} else if (invit.to === oldNickname) {
			invit.to = nickname;
		}
	});

	// emit
	sockets.forEach((socket: GameSocket) => {
		socket.invitationList.forEach((invit: Invitation) => {
			if (invit.from === nickname || invit.to === nickname) {
				socket.emit('updateInvitationList', socket.invitationList);
				return false;
			}
		});
	});

	// Set client's new nickname
	console.log(`${client.nickname} is now ${nickname}`);
	client.nickname = nickname;
  }

//   @SubscribeMessage('nicknameChanged')
//   handleNicknameChanged(client: GameSocket, nickname: string) {
// 	const sockets = this.io.sockets;
// 	const oldNickname = client.nickname;

// 	sockets.forEach((socket: GameSocket) => {
// 		console.log("In loop", socket.nickname);
// 		console.log("Invt List", socket.invitationList);
// 		let listChanged = false;

// 		socket.invitationList.forEach((invit: Invitation) => {
// 			if (invit.from === oldNickname) {
// 				console.log("In from", socket.nickname);
// 				invit.from = nickname;
// 				listChanged = true;
// 			}
// 			if (invit.to === oldNickname) {
// 				console.log("In to", socket.nickname);
// 				invit.to = nickname;
// 				listChanged = true;
// 			}
// 		});

// 		if (listChanged) {
// 			socket.emit('updateInvitationList', socket.invitationList);
// 			console.log("In emit", socket.nickname);
// 		};
// 	});

// 	// Set client's new nickname
// 	console.log(`${client.nickname} is now ${nickname}`);
// 	client.nickname = nickname;
//   }
}