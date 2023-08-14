'use client'

import { useRef, useEffect } from "react"
import "../pages/index.css";

export default function Pong() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const contextRef = useRef(null);
  // const [canvasTag, setCanvasTag] = useState([]);


  useEffect(() => {
    // Initialize Canvas
    const canvas: any = canvasRef.current;
    console.log(canvas.clientHeight);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // 해상도(사이즈)가 window에 맞게 설정되면 게임에 영향이 있을 수 있음.
    // 상수를 할당해야 하나? 화면비를 맞춰야 하나?
    const context = canvas.getContext("2d");

    /*-----------------------------------------------------*/
    // Initialize Context
    // Paddle
    let paddleHeight = 10;
    let paddleWidth = 50;
    let paddleDiff = 25;
    let paddleX = [canvas.width / 2 - paddleWidth / 2,
      canvas.width / 2 - paddleWidth / 2];
    let trajectoryX = [0, 0];
    let playerMoved = true;

    // Ball
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 5;
    let ballDirection = 1;

    // Speed
    let speedY = 5;
    let speedX = 0.07;

    /*-----------------------------------------------------*/

    // Coordinate of Ball
    // Adjust Ball Movement
    const ballMove = () => {
      // Vertical Speed
      ballY += speedY * ballDirection;
      // Horizontal Speed
      if (playerMoved) {
        ballX += speedX;
      }

      // todo - 소켓 이벤트
      // socket.emit("ballMove", {
      //   ballX,
      //   ballY,
      //   score,
      // });
    }

    const ballReset = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      speedY = 3;
      // todo -console.log("in ballreset ", refreeRoom);
      // socket.emit("ballMove", {
      //   ballX,
      //   ballY,
      //   score,
      // });
    }

    const ballBoundaries = () => {
      // Bounce off Left Wall
      if (ballX < 0 && speedX < 0) {
        speedX = -speedX;
      }
      // Bounce off Right Wall
      if (ballX > canvas.width && speedX > 0) {
        speedX = -speedX;
      }
      // Bounce off player paddle (bottom)
      if (ballY > canvas.height - paddleDiff) {
        if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
          // Add Speed on Hit
          if (playerMoved) {
            speedY += 1;
            // Max Speed
            if (speedY > 10) {
              speedY = 10;
            }
          }
          ballDirection = -ballDirection;
          trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
          speedX = trajectoryX[0] * 0.3;
        } else {
          // todo - Reset Ball, add to Computer Score
          ballReset();
          // score[1]++;
        }
      }
      // Bounce off computer paddle (top)
      if (ballY < paddleDiff) {
        if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
          // Add Speed on Hit
          if (playerMoved) {
            speedY += 1;
            // Max Speed
            if (speedY > 10) {
              speedY = 10;
            }
          }
          ballDirection = -ballDirection;
          trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
          speedX = trajectoryX[1] * 0.3;
        } else {
          // Reset Ball, Increase Computer Difficulty, add to Player Score
          // todo
          ballReset();
          // score[0]++;
        }
      }
    }

    /*-----------------------------------------------------*/

    // Draw
    // Canvas Background
    const drawBackground = () => {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
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
      context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
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
      ballMove();
      ballBoundaries();
      drawBall();
    }

    /*-----------------------------------------------------*/
    setInterval(draw, 10);
  }, [])

  // console.log("canvasTag :", canvasTag);

  return (
      <div className="box box-center">
        <canvas className="pong" ref={canvasRef}/>
      </div>
  )
}
