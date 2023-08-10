import { Socket } from "socket.io"

export type AuthPayload = {
    userId: string;
}

export type SocketWithAuth = Socket & AuthPayload;