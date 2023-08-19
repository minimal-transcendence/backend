import { GameSocket } from "./types";

export class GameRoom {
    // Interval
    interval: any;
    // Room Name
    name: string;
    // mode: string;
    // Players
    playerOne: GameSocket;
    playerTwo: GameSocket;
    // players: object;
    // Check Every Player Accept this Match
    playerOneAccept: boolean;
    playerTwoAccept: boolean;
    // Canvas
    canvasWidth: number;
    canvasHeight: number;
    // Paddle
    paddleHeight: number;
    paddleWidth: number;
    paddleDiff: number;
    paddleX: number[];
    trajectoryX = [0, 0];
    playerMoved = false;
    // Ball
    ballX: number;
    ballY: number;
    ballRadius: number;
    ballDirection: number;
    // Speed
    speedY: number;
    speedX: number;

    constructor({
        name,
        playerOne,
        playerTwo,
        // mode,
    }) {
        this.name = name
        // this.mode = mode
        this.playerOne = playerOne
        this.playerTwo = playerTwo

        this.playerOneAccept = false;
        this.playerTwoAccept = false;
        //Canvas
        this.canvasWidth = 900;
        this.canvasHeight = 1600;
        // Paddle
        this.paddleHeight = 10;
        this.paddleWidth = 50;
        this.paddleDiff = 25;
        this.paddleX = [this.canvasWidth / 2 - this.paddleWidth / 2,
        this.canvasWidth / 2 - this.paddleWidth / 2];
        this.trajectoryX = [0, 0];
        this.playerMoved = false;
        // Ball
        this.ballX = this.canvasWidth / 2;
        this.ballY = this.canvasHeight / 2;
        this.ballRadius = 5;
        this.ballDirection = 1;
        // Speed
        this.speedY = 2;
        this.speedX = 0.07;
    }
}