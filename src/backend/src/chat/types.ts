import { Socket } from "socket.io"

type JwtPayload = {
    userId: string,
    email: string,
    nickname: string,
}

export type ChatSocket = Socket & JwtPayload;