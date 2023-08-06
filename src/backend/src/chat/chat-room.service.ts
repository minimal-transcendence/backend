export class ChatUser {
	rooms : string[];	//or int?
	id : number;	//?
	nickname : string;
	blockusers? : ChatUser[]

	constructor(
		id : number,
		nickname : string,
		rooms : string,
	){
		//접속하면 자기 자신의 아이디와 같은 방....?
		//그런데 그러면 유저 아이디나 별명의 이름을 갖는 채팅방은 못 만드는거 아닌가...?

	}
}

export class ChatRoomUser {
	id : number;
	nickname : string;	//id 굳이 필요 있...?
	// isOwner : boolean;	-> chat 방만 있어도 될지도
	isOperator : boolean;
	isMuted : boolean;

	constructor(
		id : number,
		nickname : string,
		isOperator? : boolean,
	){
		this.id = id;
		this.nickname = nickname;
		//잘 되는지 체크
		this.isOperator = isOperator ? isOperator : false;
		this.isMuted = true;
	}
}

export class ChatRoom {
	id : string;	//socketid?
	roomname : string;
	password? : string;
	users: ChatRoomUser[];
	owner: ChatRoomUser;
	operators: ChatRoomUser[];

	constructor(
		id : string,
		roomname: string,
		creator: ChatRoomUser,
		password? : string,
	){
		this.id = id;
		this.roomname = roomname;
		this.password = password;
		this.users.push(creator);
		this.owner = creator;
		this.operators.push(creator);
	}
}
