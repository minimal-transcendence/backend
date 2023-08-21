'use client'

import { useRef, useEffect, useState } from "react";
import "../pages/index.css";
import {socket} from "../pages/Home";

type Keys = {
  left: {
    pressed: boolean
  },
  right: {
    pressed: boolean
  },
}

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize Canvas
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    // Component
    // canvas.width = canvas.clientWidth;
    // canvas.height = canvas.clientHeight;
    // Window
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // Literal
    // canvas.width = 900;
    // canvas.height = 1600;
    // 해상도(사이즈)가 window에 맞게 설정되면 게임에 영향이 있을 수 있음.
    // 상수를 할당해야 하나? 화면비를 맞춰야 하나?

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    /*-----------------------------------------------------*/
    let inGame: boolean = false;
    let roomName: string;
    let interval: any;

    // Boundary
    // let width: number;
    // let height: number;

    // Paddle
    let paddleHeight: number;
    let paddleWidth:number;
    let paddleX: number[];

    // Ball
    let ballX: number;
    let ballY: number;
    let ballRadius: number;

    // Key Event
    const keys = {
      left: {
        pressed: false
      },
      right: {
        pressed: false
      },
    }

    /*-----------------------------------------------------*/

    // Draw
    // Canvas Background
    const drawBackground = () => {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      // if (width) {
      //   context.strokeRect(canvas.width / 2 - width / 2, 0, width, height)
      // }
    }

    // Draw Paddle
    const drawPaddle = () => {
      context.fillStyle = "white";
      // Bottom Paddle
      context.fillRect(paddleX[0], canvas.height - 20, paddleWidth, paddleHeight);
      // Top Paddle
      context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);
    }

    // Draw Ball
    const drawBall = () => {
      context.beginPath();
      context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      context.fillStyle = "white";
      context.fill();
    }

    // Dashed Center Line
    const drawCenterLine = () => {
      context.beginPath();
      context.setLineDash([4]);
      context.moveTo(0, canvas.height / 2);
      context.lineTo(canvas.width, canvas.height / 2);
      context.strokeStyle = "grey";
      context.stroke();
    }

    // Draw All Context
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawCenterLine();
      drawPaddle();
      drawBall();
    }

    /*-----------------------------------------------------*/

    // Draw Lobby
    const drawLobby = () => {
      canvas.width = 900;
      canvas.height = 1600;
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      context.beginPath();
      context.arc(450, 800, 300, Math.PI, 2 * Math.PI);
      context.fillStyle = "white";
      context.fill();
    }

    drawLobby();

    // Draw Game Over
    const drawGameOver = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      context.beginPath();
      context.arc(450, 800, 300, Math.PI, 2 * Math.PI);
      context.fillStyle = "red";
      context.fill();
    }

    // Start Game
    socket.on("startGame", (data: any) => {
      inGame = true;
      // setInGame(true);
      roomName = data.roomName;
      // setRoomName(data.roomName);
      canvas.width = data.canvasWidth;
      canvas.height = data.canvasHeight;
      paddleWidth = data.paddleWidth;
      paddleHeight = data.paddleHeight;
      paddleX = data.paddleX;
      ballX = data.ballX;
      ballY = data.ballY;
      ballRadius = data.ballRadius;

      interval = setInterval(() => {
        // Draw Canvas
        draw();
        // Emit Key Event
        if (keys.left.pressed) {
          socket.emit('keydown', {
            roomName: roomName,
            key: 'ArrowLeft'
          });
        }
  
        if (keys.right.pressed) {
          socket.emit('keydown', {
            roomName: roomName,
            key: 'ArrowRight'
          });
        }
      }, 15);
    })

    // Listen Key Event - keydown
    canvas.addEventListener("keydown", (e: KeyboardEvent) => {
      console.log(inGame);
      if (!inGame) {
        return;
      }
      switch (e.key) {
        case 'ArrowLeft':
          keys.left.pressed = true;
          break

        case 'ArrowRight':
          keys.right.pressed = true;
          break
      }
    });
    // Listen Key Event - keyup
    canvas.addEventListener("keyup", (e: KeyboardEvent) => {
      if (!inGame) {
        return;
      }
      switch (e.key) {
        case 'ArrowLeft':
          keys.left.pressed = false;
          break

        case 'ArrowRight':
          keys.right.pressed = false;
          break
      }
    });

    // Get Game Data from Server
    socket.on('gameData', (payload: any) => {
      ballX = payload.ballX;
      ballY = payload.ballY;
      paddleX = payload.paddleX;
      // console.log(paddleX);
    })

    // Game Over
    socket.on('gameOver', (payload: any) => {
      clearInterval(interval);
      drawGameOver();
      inGame = false;
    })
  }, [])

  return (
    <div className="box box-center">
      <canvas
        className="pong"
        ref={canvasRef}
        tabIndex={0}
      />
    </div>
  )
}

