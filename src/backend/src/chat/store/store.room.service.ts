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
		password? : string,
	){
		// this.roomId = roomId;
		// this.roomname = roomname;
		this.password = password? password : null;	//or ''?
		this.owner = owner;
		this.operators = new Set();
		this.userlist = new Set();
		this.userlist.add(owner);
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

	isJoinning(userid : number) : boolean {
		return (this.userlist.has(userid));
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
	addUserToUserlist(userid : number){
		this.userlist.add(userid);
	}

	addUserToBanlist(userid : number){
		//여기서 setTimeOut을 하면... 내가 원하는 대로 실행이 됨...?
		//CHECK : 필수ㅠㅠ
		this.banlist.add(userid);
		setTimeout((userid : number) => {
			this.banlist.delete(userid);
		}, 60000);	//60초 뒤에...
	}

	deleteUserFromUserlist(userid : number){
		this.userlist.delete(userid);
	}

	addUserToOperators(userid : number){
		this.operators.add(userid);
	}

	deleteUserFromOperators(userid : number){
		this.operators.delete(userid);
	}

	addUserToMutelist(userid : number){
		this.mutelist.add(userid);
		setTimeout((userid : number) => {
			this.mutelist.delete(userid);
		}, 60000);
	}

	//자동으로 일정시간만?
	// deleteUserFromMutelist(userid : number){
	// 	this.mutelist.delete(userid);
	// }
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
	
	findRoom(roomName : string) : Room;
	saveRoom(roomName : string, room : Room) : void;
	findAllRoom() : Room[];
}

@Injectable()
export class ChatRoomStoreService implements RoomStore{
	rooms = new Map();

	findRoom(roomName: string): Room {
		return this.rooms.get(roomName);
	}

	//여기는 password가 필요하다
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

	//startWith? includes?
	findQueryMatchRoomNames(query : string) : string[] {
		const res = [];
		this.rooms.forEach((_, key) => {
			if (key.includes(query))
				res.push(key);
		})
		return (res);
	}
}

