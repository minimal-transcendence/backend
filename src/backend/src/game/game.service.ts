import { Injectable } from '@nestjs/common';
import { GameSocket } from './types';
import { GameRoom } from './GameRoom';
import { Namespace } from 'socket.io';

@Injectable()
export class GameService {
  validatePlayerInRoom(
      player: GameSocket,
      gameRoom: GameRoom,
      ) {
      if (!gameRoom) {
          throw new Error('no such room');
        }

      if (player !== gameRoom.player[0] && player !== gameRoom.player[1]) {
          throw new Error(`no such user in the room: ${player.id}`);
      }
  }

  startGame(io: Namespace, room: GameRoom) {
    // Set gameStart
    room.gameStart = true;
    // send game data for Init
      io.to(room.name).emit('startGame', {
      roomName: room.name,
      mode: room.mode,
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
      this.ballMove(room);

      // console.log("Speed X:", room.speedX);

      // send game data for drawing
      io.to(room.name).emit('gameData', {
        roomName: room.name,
        ballX: room.ballX,
        ballY: room.ballY,
        paddleX: room.paddleX,
        playerScore: room.playerScore,
      });
    }, 15);
  }

  ballMove(room: GameRoom) {
    // Vertical Speed
    room.ballY += room.speedY * room.ballDirection;
    // Horizontal Speed
    room.ballX += room.speedX;
    // Bounce off Left Wall
    if (room.ballX < 0 && room.speedX < 0) {
      room.speedX = -room.speedX;
    }
    // Bounce off Right Wall
    if (room.ballX > room.canvasWidth && room.speedX > 0) {
      room.speedX = -room.speedX;
    }
    
    if (room.ballY > room.canvasHeight - room.paddleDiff) {
      // Bounce off player paddle (bottom)
      if (room.ballX >= room.paddleX[0] && room.ballX <= room.paddleX[0] + room.paddleWidth) {
          // Add Speed on Hit
          room.speedY += 1;
          // Max Speed
          if (room.speedY > room.maxSpeedY) {
              room.speedY = room.maxSpeedY;
          }
          room.ballDirection = -room.ballDirection;
          room.speedX = room.speedX > 0 ?
            Math.random() * room.maxSpeedX :
            Math.random() * -room.maxSpeedX;
      } else {
        // Add to Computer Score
        room.playerScore[1]++;
        console.log(room.playerScore);
        // Game Over
        if (room.playerScore[1] >= 3) {
          clearInterval(room.interval);
          room.winner = room.player[1].nickname;
          room.loser = room.player[0].nickname;
          room.gameOver = true;
          console.log("-----Game Over-----");
          console.log("Winner:", room.winner);
          console.log("Loser:", room.loser);
          console.log("-------Score-------");
          console.log(`${room.playerScore[0]} - ${room.player[0].nickname}`);
          console.log(`${room.playerScore[1]} - ${room.player[1].nickname}`);
          return;
        }
        // Reset Ball
        room.ballX = room.canvasWidth / 2;
        room.ballY = room.canvasHeight / 2;
        room.speedY = room.defaultSpeedY;
        room.speedX = 0;
      }
    }

    if (room.ballY < room.paddleDiff) {
      // Bounce off computer paddle (top)
      if (room.ballX >= room.paddleX[1] && room.ballX <= room.paddleX[1] + room.paddleWidth) {
        // Add Speed on Hit
        room.speedY += 1;
          // Max Speed
          if (room.speedY > room.maxSpeedY) {
              room.speedY = room.maxSpeedY;
          }

          room.ballDirection = -room.ballDirection;
          room.speedX = room.speedX > 0 ?
            Math.random() * room.maxSpeedX :
            Math.random() * -room.maxSpeedX;
      } else {
        // Add to Player Score
        room.playerScore[0]++;
        console.log(room.playerScore);
        // Game Over
        if (room.playerScore[0] >= 3) {
          clearInterval(room.interval);
          room.winner = room.player[0].nickname;
          room.loser = room.player[1].nickname;
          room.gameOver = true;
          console.log("-----Game Over-----");
          console.log("Winner:", room.winner);
          console.log("Loser:", room.loser);
          console.log("-------Score-------");
          console.log(`${room.playerScore[0]} - ${room.player[0].nickname}`);
          console.log(`${room.playerScore[1]} - ${room.player[1].nickname}`);
          return;
        }
        // Reset Ball
        room.ballX = room.canvasWidth / 2;
        room.ballY = room.canvasHeight / 2;
        room.speedY = room.defaultSpeedY;
        room.speedX = 0;
      }
    }
  }

  getSocketByNickname(io: Namespace, nickname: string): GameSocket | null {
    io.sockets.forEach((e: any) => {
      if (e.nickname === nickname) {
        return e as GameSocket;
      }
    })
    return null;
  }

  objectsAreSame(x: Object, y: Object): boolean {
    var objectsAreSame: boolean = true;
    for(var propertyName in x) {
      // console.log(`x ${propertyName}: ${x[propertyName]}`);
      // console.log(`y ${propertyName}: ${y[propertyName]}`);
      if(x[propertyName] !== y[propertyName]) {
        // console.log(`${x[propertyName]}, ${y[propertyName]} - Not same`)
        objectsAreSame = false;
        break;
      }
    }
    // console.log("Same object");
    return objectsAreSame;
 }
}
