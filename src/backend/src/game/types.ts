import { Socket } from "socket.io"

export type AuthSocket = {
    userId: string;
    email: string;
}

export type SocketWithAuth = Socket & AuthSocket;