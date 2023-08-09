import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

//방도 number 로 관리해야한다 -> message from / to format
class Room {
	//readonly 랑 const 차이?
	readonly roomId : number;
	readonly roomname : string;
	password : string;
	owner : number;
	operators : Set<number>;
	mutelist : Set<number>;
	//should i have userlists? while socket.io observe it?

	constructor(
		roomId: number,
		roomname : string,
		owner : number
	){
		this.roomId = roomId;
		this.roomname = roomname;
		this.password = null;	//or ''?
		this.owner = owner;
		this.operators = new Set();
		this.mutelist = new Set();
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

	updatePassword(newPassword : string){
		this.password = newPassword;
	}

	//이전 owner가 valid 한지 체크 -> service에서 하자
	//에러 시 throw?
	updateOwner(oldOwner : number, newOwner : number){
		this.owner = newOwner;
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

	clearSets(){
		this.operators.clear();
		this.mutelist.clear();
	}

	clearRoom(){
		this.operators = null;
		this.mutelist = null;
	}
}

interface RoomStore{
	//답이 없다... ㄸㄹㄹ... key를 roomname으로 쓰고 message쉽게 찾기 가능...?ㅠㅠ
	//string으로 찾는게 좋을까.... int로 찾는게 좋을까...?ㅠㅠ
	//찾을 땐 string으로 찾는게 맞는 것 같은데...!
	//근데 또 room객체에 roomname 조회할 일도 많을 것 같음 ㄸㄹㄹ
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

	getRoomId(roomname : string) : number {
		// return this.findRoom.id; 는 왜 안 될까?
		return this.rooms.get(roomname).id;
	}

	//이게 맞나...?
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

