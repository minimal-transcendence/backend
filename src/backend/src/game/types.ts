import { Socket } from "socket.io"

export type GameListItem = {
    from: string,
    to: string,
    level: number,
}

type Player = {
    inGame: boolean;
    gameList: GameListItem[];
}

type JwtPayload = {
    userId: string,
    email: string,
    nickname: string,
}

export type KeydownPayload = {
    roomName: string;
    key: string;
}

export type OneOnOneInvite = {
    to: string;
    level: number;
}

export type OneOnOneAccept = {
    from: string;
    level: number;
}

export type GameRoomParams = {
    name: string;
    players: GameSocket[];
    level: number;
}

export type GameSocket = Socket & JwtPayload & Player;