import { Injectable } from '@nestjs/common';
import { SocketWithAuth } from 'src/chat/types';
import { GameRoom } from './GameRoom';

@Injectable()
export class GameService {
    validatePlayerInRoom(
        player: SocketWithAuth,
        gameRoom: GameRoom,
        ) {
        if (!gameRoom) {
            throw new Error('no such room');
          }

        if (player !== gameRoom.playerOne && player !== gameRoom.playerTwo) {
            throw new Error(`no such user in the room: ${player.id}`);
        }
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
}
