import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Message } from './store.message.service';

//방도 number 로 관리해야한다 -> message from / to format
export class Room {
	//readonly 랑 const 차이?
	//room을 private이랑 분리하게 되면 roomId 필요없는 듯
	// readonly roomId : number;
	// readonly roomname : string;
	password : string | null;
	owner : number;
	operators : Set<number>;
	userlist : Set<number>;	//있긴 있어야할듯... socket은 모든 접속에 id를 부여하니까ㅠ
	//kick, ban, mute	//kicklist banlist 분리?
	mutelist : Set<number>;
	banlist : Set<number>;
	messages : Message[];

	constructor(
		// roomId: number,
		owner : number,
		password? : string
	){
		// this.roomId = roomId;
		// this.roomname = roomname;
		this.password = password? password : null;	//or ''?
		this.owner = owner;
		this.operators = new Set();
		// this.operators.add(owner);
		this.userlist = new Set();
		this.mutelist = new Set();
		this.banlist = new Set();
		this.messages = [];
	}

	isPassword(input : string) : boolean {
		return (input === this.password);
	}

	isOwner(userid : number) : boolean {
		return (userid === this.owner);
	}
	
	isOperator(userid : number) : boolean {
		return (this.operators.has(userid));
	}

	isMuted(userid : number) : boolean {
		return (this.mutelist.has(userid));
	}
	
	isBanned(userid : number) : boolean {
		return (this.banlist.has(userid));
	}

	updatePassword(newPassword : string){
		this.password = newPassword;
	}

	updateOwner(newOwner : number){
		this.owner = newOwner;
		// this.operators.delete(oldOwner);
		// this.operators.add(newOwner);
	}

	//후... 이거 묶을 걸 그랬나ㅠ
	addUserToUserlist(userId : number){
		this.userlist.add(userId);
	}

	deleteUserFromUserlist(userId : number){
		this.userlist.delete(userId);
	}

	addUserToOperators(userid : number){
		this.operators.add(userid);
	}

	deleteUserFromOperators(userid : number){
		this.operators.delete(userid);
	}

	addUserToMutelist(userid : number){
		this.mutelist.add(userid);
	}

	deleteUserFromMutelist(userid : number){
		this.mutelist.delete(userid);
	}
	private clearSets(){
		this.userlist.clear();
		this.operators.clear();
		this.mutelist.clear();
		this.banlist.clear();
	}

	clearRoom(){
		this.clearSets();
		this.operators = null;
		this.mutelist = null;
		this.banlist = null;
		this.userlist = null;
	}

	storeMessage(from : number, body : string){
		this.messages.push(new Message(from, body));
	}
}

interface RoomStore{
	//방을 DM이랑 분리하게 되면 아이디는 필요없다!
	rooms : Map<string, Room>;
	
	findRoom(roomname : string) : Room;
	saveRoom(roomname : string, room : Room) : void;
	findAllRoom() : Room[];
}

@Injectable()
export class ChatRoomStoreService implements RoomStore{
	rooms = new Map();

	findRoom(roomname: string): Room {
		return this.rooms.get(roomname);
	}

	saveRoom(roomname: string, room: Room): void {
		this.rooms.set(roomname, room);
	}

	findAllRoom(): Room[] {
		return [...this.rooms.values()];
	}

	deleteRoom(roomname: string) : void {
		const target = this.rooms.get(roomname);
		if (target !== undefined)
			target.clearRoom();
		this.rooms.delete(roomname);
	}
	// 이제 필요 없다!
	// getRoomId(roomname : string) : number {
	// 	return (this.findRoom(roomname).roomId);
	// }

	//이하의 내용은 chatService 에다가....
	//이 서비스에다가 socket 전달 가능...? javascript는 소켓을 복사하는지 가리키는지 뭔지 진짜 모르겠다 흑흑
	//memory leaks 어떻게 체크하나요...
	// joinRoom(client: Socket, roomname : string, password : string | null){
	// 	//방이 안 존재하면 -> 방을 만들고
	// 	if (this.findRoom(roomname) === undefined){

	// 	}

	// 	if (!this.rooms.get(roomname).isPassword(password))
	// 		throw new Error("Wrong password");
	// 	//존재하면 -> 있는 방을 찾아서 들어간다
	// }
	//차차 하자...
}

