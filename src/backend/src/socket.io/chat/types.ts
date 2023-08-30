import { Socket } from "socket.io"

export type userInfo = {
	id : number;
	nickname : string;
	isGaming : boolean;
	isConnected? : boolean;
}

export type roomInfo = {
	roomname : string;
	lastMessage : string;
}

export type currRoomInfo = {
	roomname : string;
	owner : string;
	operators : string[];
	messages : formedMessage[];
}

export type formedMessage = {
	from : string;
	to?	: string;
	body : string;
	at? : number
}

type JwtPayload = {
    userId: number;
    email: string;
}

type AuthSocket = {
    nickname: string;
}

export type ChatSocket = Socket & JwtPayload & AuthSocket;
