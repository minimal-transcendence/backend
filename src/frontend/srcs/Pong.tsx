'use client'

import { useRef, useEffect, useContext, useState } from "react";
import "../pages/index.css";
import { SocketContent, SocketContext } from "@/pages/App";
// import {socket} from "../pages/Home";

export type AutoSave = {
  roomName: string;
  inGame: boolean;
  // inLobby: boolean;
  gameOver: boolean;
  player: string[];
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
  winner: string;
  loser: string;
}

type StartGameData = {
  roomName: string;
  player: string[];
  mode: string;
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  paddleX: number[];
  ballX: number;
  ballY: number;
  ballRadius: number;
}

type GameOverData = {
  roomName: string;
  winner: string;
  loser: string;
}

type GameData = {
  roomName: string;
  ballX: number;
  ballY: number;
  paddleX: number[];
  playerScore: number[];
}

export default function Pong() {
  const [inGame, setInGame] = useState<boolean>(false);
  // const [inLobby, setInLobby] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appContext = useContext<SocketContent>(SocketContext);
  const socket: any = appContext.gameSocket;
  

  
  useEffect(() => {
    //Socket
    console.log("In Pong", socket);
    
    // console.log(socket);
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
    // let inGame: boolean = false;
    let interval: any;

    let roomName: string;
    let mode: string;
    let winner: string;
    let loser: string;
    let player: string[];

    // Score
    let score: number[] = [0, 0];

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

    /*-------------------Set Data from localStorage----------------------------*/

    // localStorage Data
    const item = localStorage.getItem("gameRoomData");
    if (item) {
      const saved = JSON.parse(item);
      roomName = saved.roomName,
      setInGame(saved.inGame);
      // inLobby: boolean;
      // setGameOver(saved.gameOver);
      player = saved.player;
      canvas.width = saved.canvasWidth;
      canvas.height = saved.canvasHeight;
      paddleWidth = saved.paddleWidth;
      paddleHeight = saved.paddleHeight;
      ballRadius = saved.ballRadius;
      winner = saved.winner;
      loser = saved.loser;
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

    // Draw Lobby
    const drawLobby = () => {
      canvas.width = 900;
      canvas.height = 1600;
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      context.fillStyle = "white";
      context.font = "70px serif";
      context.fillText("This is Lobby", 10, (canvas.height / 2) - 290);
    }

    // Draw Game Over
    const drawGameOver = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      context.fillStyle = "white";
      context.font = "70px serif";
      context.fillText("Game Over", 10, (canvas.height / 2) - 290);
      context.fillText(`Winner: ${winner}`, 10, (canvas.height / 2) - 200);
      context.fillText(`Loser: ${loser}`, 10, (canvas.height / 2) - 110);
      // context.fill();
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

    // Draw Score
    const drawScore = () => {
      context.font = "70px serif";
      context.fillStyle = "grey";
      context.fillText(`${player[1]}: ${score[1].toString()}`, 10, (canvas.height / 2) - 20);
      context.fillText(`${player[0]}: ${score[0].toString()}`, 10, (canvas.height / 2) + 70);
    }

    // Draw All Context
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawCenterLine();
      drawScore();
      drawPaddle();
      drawBall();
    }

    /*-----------------------------------------------------*/

    // Lobby
    // if (!inGame) {
      drawLobby();
    // }

    if (inGame) {
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
    }

    if (gameOver) {
      drawGameOver();
    }

    // Start Game
    socket.on("startGame", (payload: StartGameData) => {
      // inGame = true;

      roomName = payload.roomName;
      player = payload.player;
      mode = payload.mode,
      canvas.width = payload.canvasWidth;
      canvas.height = payload.canvasHeight;
      paddleWidth = payload.paddleWidth;
      paddleHeight = payload.paddleHeight;
      paddleX = payload.paddleX;
      ballX = payload.ballX;
      ballY = payload.ballY;
      ballRadius = payload.ballRadius;

      localStorage.setItem("gameRoomData", JSON.stringify({
        roomName: payload.roomName,
        inGame: true,
        gameOver: false,
        player: payload.player,
        canvasWidth: payload.canvasWidth,
        canvasHeight: payload.canvasHeight,
        paddleWidth: payload.paddleWidth,
        paddleHeight: payload.paddleHeight,
        ballRadius: payload.ballRadius,
        winner: '',
        loser: '',
      }))

      setInGame(true);
      setGameOver(false);

      // interval = setInterval(() => {
      //   // Draw Canvas
      //   draw();
      //   // Emit Key Event
      //   if (keys.left.pressed) {
      //     socket.emit('keydown', {
      //       roomName: roomName,
      //       key: 'ArrowLeft'
      //     });
      //   }
  
      //   if (keys.right.pressed) {
      //     socket.emit('keydown', {
      //       roomName: roomName,
      //       key: 'ArrowRight'
      //     });
      //   }
      // }, 15);
    })

    // Listen Key Event - keydown
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          keys.left.pressed = true;
          break

        case 'ArrowRight':
          keys.right.pressed = true;
          break
      }
    }

    const handleKeyup = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          keys.left.pressed = false;
          break

        case 'ArrowRight':
          keys.right.pressed = false;
          break
      }
    }

    canvas.addEventListener("keydown", handleKeydown);
    canvas.addEventListener("keyup", handleKeyup);

    // canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    //   // if (!inGame) {
    //   //   console.log("Keydown ignored");
    //   //   return;
    //   // } else {
    //   //   console.log("Keydown!!!!!!!!");
    //   // }
    //   // if (gameOver) {
    //   //   console.log("this game is over");
    //   //   return;
    //   // }
    //   console.log("Keydown:", e.key);
    //   switch (e.key) {
    //     case 'ArrowLeft':
    //       keys.left.pressed = true;
    //       break

    //     case 'ArrowRight':
    //       keys.right.pressed = true;
    //       break
    //   }
    // });
    // Listen Key Event - keyup
    // canvas.addEventListener("keyup", (e: KeyboardEvent) => {
    //   if (gameOver) {
    //     return;
    //   }
    //   switch (e.key) {
    //     case 'ArrowLeft':
    //       keys.left.pressed = false;
    //       break

    //     case 'ArrowRight':
    //       keys.right.pressed = false;
    //       break
    //   }
    // });

    // Get Game Data from Server
    socket.on('gameData', (payload: GameData) => {
      ballX = payload.ballX;
      ballY = payload.ballY;
      paddleX = payload.paddleX;
      score = payload.playerScore;
      // console.log(paddleX);
    })

    // Game Over
    socket.on('gameOver', (payload: GameOverData) => {
      clearInterval(interval);
      winner = payload.winner;
      loser = payload.loser;
      // drawGameOver();
      // inGame = false;
      localStorage.setItem("gameRoomData", JSON.stringify({
        roomName: payload.roomName,
        inGame: false,
        // inLobby: true,
        gameOver: true,
        player: [],
        canvasWidth: 0,
        canvasHeight: 0,
        paddleWidth: 0,
        paddleHeight: 0,
        ballRadius: 0,
        winner: payload.winner,
        loser: payload.loser,
      }))
      setInGame(false);
      setGameOver(true);
    })

    console.log("EVERYTING RE RENDER");

    // clean up
    return (() => {
      console.log("clearInterval");
      clearInterval(interval);
      canvas.removeEventListener("keydown", handleKeydown);
      canvas.removeEventListener("keyup", handleKeyup);
    })
  }, [socket, inGame, gameOver])

  return (
    <div className="chat-main">
      <canvas
        className="pong"
        ref={canvasRef}
        tabIndex={0}
      />
    </div>
  )
}

