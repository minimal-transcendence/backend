import { Socket } from "socket.io"
import { IsNotEmpty } from 'class-validator';

// export type OneOnOnePayload = {
//     from: string;
//     to: string;
//     mode: string;
// }

export class OneOnOnePayload {
    @IsNotEmpty()
    from: string;
    @IsNotEmpty()
    to: string;
    @IsNotEmpty()
    mode: string;
}

// export type Invitation = {
//     from: string;
//     fromId: number;
//     to: string;
//     toId: number;
//     mode: string;
// }

export class Invitation {
    @IsNotEmpty()
    from: string;
    @IsNotEmpty()
    fromId: number;
    @IsNotEmpty()
    to: string;
    @IsNotEmpty()
    toId: number;
    @IsNotEmpty()
    mode: string;
}

type Player = {
    nickname: string;
    inGame: boolean;
    invitationList: Invitation[];
}

type JwtPayload = {
    userId: number;
    email: string;
}

// export type KeydownPayload = {
//     roomName: string;
//     key: string;
// }

export class KeydownPayload {
    @IsNotEmpty()
    roomName: string;
    @IsNotEmpty()
    key: string;
}

export type GameRoomParams = {
    name: string;
    player: GameSocket[];
    mode: string;
}

export type GameSocket = Socket & JwtPayload & Player;