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

      if (player !== gameRoom.playerOne && player !== gameRoom.playerTwo) {
          throw new Error(`no such user in the room: ${player.id}`);
      }
  }

  startGame(io: Namespace, room: GameRoom) {
    // send game data for Init
      io.to(room.name).emit('startGame', {
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
      this.ballMove(room);

      // send game data for drawing
      io.to(room.name).emit('gameData', {
        roomName: room.name,
        ballX: room.ballX,
        ballY: room.ballY,
        paddleX: room.paddleX
      });
    }, 15);
  }

  ballMove(room: GameRoom) {
      // Vertical Speed
      room.ballY += room.speedY * room.ballDirection;
      // Horizontal Speed
      room.ballX += room.speedX;
      // todo - ball bound
      // Bounce off Left Wall
    if (room.ballX < 0 && room.speedX < 0) {
      room.speedX = -room.speedX;
    }
    // Bounce off Right Wall
    if (room.ballX > room.canvasWidth && room.speedX > 0) {
      room.speedX = -room.speedX;
    }
    // Bounce off player paddle (bottom)
    if (room.ballY > room.canvasHeight - room.paddleDiff) {
      if (room.ballX >= room.paddleX[0] && room.ballX <= room.paddleX[0] + room.paddleWidth) {
          // Add Speed on Hit
          room.speedY += 1;
          // Max Speed
          if (room.speedY > 5) {
              room.speedY = 5;
          }
          room.ballDirection = -room.ballDirection;
          room.trajectoryX[0] = room.ballX - (room.paddleX[0] + room.paddleDiff);
          room.speedX = room.trajectoryX[0] * 0.3;
      } else {
        // todo - Reset Ball, add to Computer Score
          //   ballReset();
          room.ballX = room.canvasWidth / 2;
          room.ballY = room.canvasHeight / 2;
          room.speedY = 3;
          // todo -console.log("in ballreset ", refreeRoom);
          // socket.emit("ballMove", {
          //     ballX,
          //     ballY,
          // });
        // score[1]++;
      }
    }
    // Bounce off computer paddle (top)
    if (room.ballY < room.paddleDiff) {
      if (room.ballX >= room.paddleX[1] && room.ballX <= room.paddleX[1] + room.paddleWidth) {
        // Add Speed on Hit
        room.speedY += 1;
          // Max Speed
          if (room.speedY > 5) {
              room.speedY = 5;
          }

          room.ballDirection = -room.ballDirection;
          room.trajectoryX[1] = room.ballX - (room.paddleX[1] + room.paddleDiff);
          room.speedX = room.trajectoryX[1] * 0.3;
      } else {
        // Reset Ball, Increase Computer Difficulty, add to Player Score
        // todo
      //   ballReset();
          room.ballX = room.canvasWidth / 2;
          room.ballY = room.canvasHeight / 2;
          room.speedY = 3;
        // score[0]++;
      }
    }
  }

  getSocketByNickname(io: Namespace, nickname: string): GameSocket | null {
    io.sockets.forEach((e: any) => {
      if (e.nickname=== nickname) {
        // toClient = e as GameSocket;
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
