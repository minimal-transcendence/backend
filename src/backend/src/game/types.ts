import { Socket } from "socket.io"

export type Invitation = {
    from: string;
    to: string;
    mode: string;
}

type Player = {
    nickname: string;ㅋ
    inGame: boolean;
    invitationList: Invitation[];
}

type JwtPayload = {
    userId: number;
    email: string;
}

export type KeydownPayload = {
    roomName: string;
    key: string;
}

export type GameRoomParams = {
    name: string;
    player: GameSocket[];
    mode: string;
}

export type GameSocket = Socket & JwtPayload & Player;