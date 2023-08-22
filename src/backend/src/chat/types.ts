import { Socket } from "socket.io"

type JwtPayload = {
    userId: string;
    email: string;
}

type AuthSocket = {
    nickname: string;
}

export type ChatSocket = Socket & JwtPayload & AuthSocket;