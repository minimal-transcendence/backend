import { GameRoomParams, GameSocket } from "./types";

export class GameRoom {
    // Interval
    interval: any;
    // Status
    gameStart: boolean;
    gameOver: boolean;
    // Room Name
    name: string;
    // Level
    level: number;
    // Players
    player: GameSocket[];
    // Check Every Player Accept this Match
    playerAccept: boolean[];
    // Canvas
    canvasWidth: number;
    canvasHeight: number;
    // Paddle
    paddleHeight: number;
    paddleWidth: number;
    paddleDiff: number;
    paddleX: number[];
    // Ball
    ballX: number;
    ballY: number;
    ballRadius: number;
    ballDirection: number;
    // Speed
    speedY: number;
    speedX: number;

    // Difficulty
    maxSpeedY: number;
    maxSpeedX: number; //fixed
    defaultSpeedY: number;

    // Game Result
    winner: string; // winners nickname
    loser: string;
    // Score
    playerScore: number[];

    constructor({
        name,
        players,
        level
    }: GameRoomParams) {
        // Status
        this.gameStart = false;
        this.gameOver = false;

        this.name = name
        this.player = [players[0], players[1]];
        this.level = level;
        //
        this.playerAccept = [false, false];
        // Score
        this.playerScore = [0, 0];
        //Canvas
        this.canvasWidth = 900;
        this.canvasHeight = 1600;

        // Set Level
        switch(level) {
            case 0 : // easy
                this.paddleWidth = 200;
                this.defaultSpeedY = 4;
                this.maxSpeedY = 10;
                break;
            case 2 : // hard
                this.paddleWidth = 100;
                this.defaultSpeedY = 8;
                this.maxSpeedY = 15;
                break;
            default : // normal
                this.paddleWidth = 150;
                this.defaultSpeedY = 6;
                this.maxSpeedY = 12;
                break;
        }
        // Paddle
        this.paddleHeight = 10;
        this.paddleDiff = 25;
        this.paddleX = [this.canvasWidth / 2 - this.paddleWidth / 2,
        this.canvasWidth / 2 - this.paddleWidth / 2];
        // Speed
        // this.speedY = 2;
        // this.speedX = 0.07;

        // Ball
        this.ballX = this.canvasWidth / 2;
        this.ballY = this.canvasHeight / 2;
        this.ballRadius = 5;
        this.ballDirection = 1;
        //Speed
        this.speedY = this.defaultSpeedY;
        this.speedX = 0;

        this.maxSpeedX = this.canvasWidth / 150
        

        // Game Result
        this.winner =  ""; // winners nickname
        this.loser = "";
    }
}