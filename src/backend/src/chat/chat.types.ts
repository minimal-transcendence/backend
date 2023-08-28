//type이랑 interface 차이?
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
	joinedUsers : string[];
	messages : formedMessage[];
}

export type formedMessage = {
	from : string;
	to?	: string;
	body : string;
	at? : number
}