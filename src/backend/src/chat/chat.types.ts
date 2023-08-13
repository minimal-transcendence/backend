//type이랑 interface 차이?
export type userInfo = {
	id : number;
	nickname : string;
	isGaming : boolean;
	isConnected? : boolean;	//
}

export type roomInfo = {
	roomname : string;
	lastMessage : string;	//모든
}

export type currRoomInfo = {
	roomname : string;
	owner : string;
	operators : string[];	//or json형식?
	joinedUsers : string[];
	messages : formedMessage[];	// TODO & CHECK : 그냥 이렇게만 적어도 되나...?
}

//여기는 export 굳이 필요한지?
export type formedMessage = {
	from : string;
	to?	: string;
	body : string;
}

export type queryResponseRoomInfo = {
	roomname : string;
	owner : string;
	joinedUsers : string[];	//owner제외
}
