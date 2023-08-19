'use client'

import { useRef, useEffect } from "react";
import "../pages/index.css";
import {socket} from "../pages/Home";

// export default function Pong() {

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   // const contextRef = useRef(null);
//   // const [canvasTag, setCanvasTag] = useState([]);

//   useEffect(() => {
//     // Initialize Canvas
//     if (!canvasRef.current) {
//       return;
//     }
//     const canvas: HTMLCanvasElement = canvasRef.current;
//     // canvas.width = canvas.clientWidth;
//     // canvas.height = canvas.clientHeight;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     // 해상도(사이즈)가 window에 맞게 설정되면 게임에 영향이 있을 수 있음.
//     // 상수를 할당해야 하나? 화면비를 맞춰야 하나?

//     const context = canvas.getContext("2d");
//     if (!context) {
//       return;
//     }

//     /*-----------------------------------------------------*/
//     // Initialize Context
//     // Paddle
//     let paddleHeight = 10;
//     let paddleWidth = 50;
//     let paddleDiff = 25;
//     let paddleX = [canvas.width / 2 - paddleWidth / 2,
//       canvas.width / 2 - paddleWidth / 2];
//     let trajectoryX = [0, 0];
//     let playerMoved = false;

//     // Ball
//     let ballX = canvas.width / 2;
//     let ballY = canvas.height / 2;
//     let ballRadius = 5;
//     let ballDirection = 1;

//     // Speed
//     let speedY = 2;
//     let speedX = 0.07;

//     /*-----------------------------------------------------*/

//     // Coordinate of Ball
//     // Adjust Ball Movement
//     const ballMove = () => {
//       // Vertical Speed
//       ballY += speedY * ballDirection;
//       // Horizontal Speed
//       if (playerMoved) {
//         ballX += speedX;
//       }

//       // todo - 소켓 이벤트
//       socket.emit("ballMove", {
//         ballX,
//         ballY,
//         // score,
//       });
//     }

//     const ballReset = () => {
//       ballX = canvas.width / 2;
//       ballY = canvas.height / 2;
//       speedY = 3;
//       // todo -console.log("in ballreset ", refreeRoom);
//       socket.emit("ballMove", {
//         ballX,
//         ballY,
//         // score,
//       });
//     }

//     const ballBoundaries = () => {
//       // Bounce off Left Wall
//       if (ballX < 0 && speedX < 0) {
//         speedX = -speedX;
//       }
//       // Bounce off Right Wall
//       if (ballX > canvas.width && speedX > 0) {
//         speedX = -speedX;
//       }
//       // Bounce off player paddle (bottom)
//       if (ballY > canvas.height - paddleDiff) {
//         if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
//           // Add Speed on Hit
//           if (playerMoved) {
//             speedY += 1;
//             // Max Speed
//             if (speedY > 5) {
//               speedY = 5;
//             }
//           }
//           ballDirection = -ballDirection;
//           trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
//           speedX = trajectoryX[0] * 0.3;
//         } else {
//           // todo - Reset Ball, add to Computer Score
//           ballReset();
//           // score[1]++;
//         }
//       }
//       // Bounce off computer paddle (top)
//       if (ballY < paddleDiff) {
//         if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
//           // Add Speed on Hit
//           if (playerMoved) {
//             speedY += 1;
//             // Max Speed
//             if (speedY > 5) {
//               speedY = 5;
//             }
//           }
//           ballDirection = -ballDirection;
//           trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
//           speedX = trajectoryX[1] * 0.3;
//         } else {
//           // Reset Ball, Increase Computer Difficulty, add to Player Score
//           // todo
//           ballReset();
//           // score[0]++;
//         }
//       }
//     }

//     /*-----------------------------------------------------*/

//     // Draw
//     // Canvas Background
//     const drawBackground = () => {
//       context.fillStyle = "black";
//       context.fillRect(0, 0, canvas.width, canvas.height);
//     }

//     // Paddle
//     const drawPaddle = () => {
//       context.fillStyle = "white";
//       // Bottom Paddle
//       context.fillRect(paddleX[0], canvas.height - 20, paddleWidth, paddleHeight);
//       // Top Paddle
//       context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);
//     }

//     // Ball
//     const drawBall = () => {
//       context.beginPath();
//       context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
//       context.fillStyle = "white";
//       context.fill();
//     }

//     // Dashed Center Line
//     const drawCenterLine = () => {
//       context.beginPath();
//       context.setLineDash([4]);
//       context.moveTo(0, canvas.height / 2);
//       context.lineTo(canvas.width, canvas.height / 2);
//       context.strokeStyle = "grey";
//       context.stroke();
//     }

//     // Draw All Context
//     const draw = () => {
//       context.clearRect(0, 0, canvas.width, canvas.height);
//       drawBackground();
//       drawCenterLine();
//       drawPaddle();
//       if (isReferee) {
//         ballMove();
//         ballBoundaries();
//       }
//       drawBall();
//     }

//     /*-----------------------------------------------------*/

//     socket.emit("ready", {});


//     let isReferee = false;
//     let paddleIndex = isReferee ? 1 : 0;

//     socket.on("startGame", (refereeId: string) => {
//       console.log("Refree is ", refereeId);

//       isReferee = socket.id === refereeId;
//       const refreeRoom = refereeId;
//       console.log("start!!", refreeRoom);
      
//       /*-----------------------------------------------------*/
//       setInterval(draw, 10);
//       /*-----------------------------------------------------*/
      


//       canvas.addEventListener("keydown", (e: KeyboardEvent) => {
//         console.log(e);
//         playerMoved = true;
//         if (e.key === "ArrowRight") {
//           paddleX[paddleIndex] += 15;
//           if (paddleX[paddleIndex] >= canvas.width - paddleWidth) {
//             paddleX[paddleIndex] = canvas.width - paddleWidth;
//           }
//         }
//         if (e.key === "ArrowLeft") {
//           paddleX[paddleIndex] -= 15;
//           if (paddleX[paddleIndex] <= 0) {
//             paddleX[paddleIndex] = 0;
//           }
//         }

//         socket.emit("paddleMove", {
//           xPosition: paddleX[paddleIndex],
//         });
//       });
//     });

//     socket.on("paddleMove", (paddleData: any) => {
//       socket.to(socket.data.gamingRoom).emit("paddleMove", paddleData);
  
//       // console.log(socket.data.gamingRoom, socket.nickname, "------paddleMove");
//     });
  
//     socket.on("ballMove", (ballData: any) => {
//       socket.to(socket.data.gamingRoom).emit("ballMove", ballData);
//       // console.log(socket.data.gamingRoom, socket.nickname, "ballMove");
//     });
//   }, [])

//   // console.log("canvasTag :", canvasTag);

//   // const handleBallMove = (e: KeyboardEvent<HTMLCanvasElement>) => {
//   //   console.log(e);
//   // };

//   return (
//     <div>
//       <canvas
//         className="pong"
//         ref={canvasRef}
//         tabIndex={0}
//       />
//     </div>
//   )
// }

/*-----------------------------------------------------------*/

export default function Pong() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const contextRef = useRef(null);
  // const [canvasTag, setCanvasTag] = useState([]);

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
    let isInGame: boolean = false;
    let roomName: string;

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

    // Paddle
    const drawPaddle = () => {
      context.fillStyle = "white";
      // Bottom Paddle
      context.fillRect(paddleX[0], canvas.height - 20, paddleWidth, paddleHeight);
      // Top Paddle
      context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);
    }

    // Ball
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

    // const welcome = () => {
    //   context.arc(450, 800, 20, Math.PI, 2 * Math.PI);
    // }

    // socket.emit("ready", {});


    // let isReferee = false;
    // let paddleIndex = isReferee ? 1 : 0;

    socket.on("startGame", (data: any) => {
      isInGame = true;
      roomName = data.roomName;
      canvas.width = data.canvasWidth;
      canvas.height = data.canvasHeight;
      paddleWidth = data.paddleWidth;
      paddleHeight = data.paddleHeight;
      paddleX = data.paddleX;
      ballX = data.ballX;
      ballY = data.ballY;
      ballRadius = data.ballRadius;

      setInterval(draw, 15);
    })

    // socket.on("startGame", (refereeId: string) => {
    //   console.log("Refree is ", refereeId);

    //   isReferee = socket.id === refereeId;
    //   const refreeRoom = refereeId;
    //   console.log("start!!", refreeRoom);
      
    //   /*-----------------------------------------------------*/
    //   setInterval(isInGame ? draw : welcome, 10);
    //   /*-----------------------------------------------------*/
      


    //   canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    //     // playerMoved = true;
    //     // if (e.key === "ArrowRight") {
    //     //   paddleX[paddleIndex] += 15;
    //     //   if (paddleX[paddleIndex] >= canvas.width - paddleWidth) {
    //     //     paddleX[paddleIndex] = canvas.width - paddleWidth;
    //     //   }
    //     // }
    //     // if (e.key === "ArrowLeft") {
    //     //   paddleX[paddleIndex] -= 15;
    //     //   if (paddleX[paddleIndex] <= 0) {
    //     //     paddleX[paddleIndex] = 0;
    //     //   }
    //     // }

    //     // socket.emit("paddleMove", {
    //     //   xPosition: paddleX[paddleIndex],
    //     // });
    //     console.log(e);

    //     if (!isInGame) {
    //       return;
    //     }

    //     switch (e.key) {
    //       case 'ArrowLeft':
    //         socket.to(socket.data.gamingRoom).emit('keydown', 'ArrowLeft');
    //         break

    //       case 'ArrowRight':
    //         socket.to(socket.data.gamingRoom).emit('keydown', 'ArrowRight');
    //         break
    //     }
    //   });
    // });

    canvas.addEventListener("keydown", (e: KeyboardEvent) => {
      if (!isInGame) {
        return;
      }

      // console.log(e);

      switch (e.key) {
        case 'ArrowLeft':
          socket.emit('keydown', {
            roomName: roomName,
            key: 'ArrowLeft'
          });
          break

        case 'ArrowRight':
          socket.emit('keydown', {
            roomName: roomName,
            key: 'ArrowRight'
          });
          break
      }
    });

    socket.on('gameData', (data: any) => {
      ballX = data.ballX;
      ballY = data.ballY;
      paddleX = data.paddleX;
      console.log(paddleX);
    })

    // socket.on("paddleMove", (paddleData: any) => {
    //   socket.to(socket.data.gamingRoom).emit("paddleMove", paddleData);
  
    //   // console.log(socket.data.gamingRoom, socket.nickname, "------paddleMove");
    // });
  
    // socket.on("ballMove", (ballData: any) => {
    //   socket.to(socket.data.gamingRoom).emit("ballMove", ballData);
    //   // console.log(socket.data.gamingRoom, socket.nickname, "ballMove");
    // });
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

