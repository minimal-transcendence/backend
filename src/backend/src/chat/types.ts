import { Socket } from "socket.io"

export type AuthSocket = {
    userId: string;
    email: string;

    inGame: boolean;
}

export type SocketWithAuth = Socket & AuthSocket;