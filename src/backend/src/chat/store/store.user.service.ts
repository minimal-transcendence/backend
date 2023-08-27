import { Injectable } from '@nestjs/common';
import { Message } from './store.message.service';

export class User {
	id : number;
	nickname : string;
	blocklist : Set<number>;
	connected : boolean;
	isGaming : boolean;
	joinlist : Set<string>;
	currentRoom : string;
	messages : Map<number, Message[]>;
	constructor(id : number, nickname : string){
		this.id = id;
		this.nickname = nickname;
		this.blocklist = new Set();
		this.connected = true;
		this.isGaming = false;
		this.joinlist = new Set();
		// this.messages = new Map();
	}

	addUserToBlocklist(userid : number){
		this.blocklist.add(userid);
	}

	deleteUserFromBlockList(userid : number){
		this.blocklist.delete(userid);
	}

	addRoomToJoinlist(roomname : string){
		this.joinlist.add(roomname);
	}

	deleteRoomFromJoinList(roomname : string){
		this.joinlist.delete(roomname);
	}

	//메모리 관리 방법을 생각하면 필요없는 것 같은데...
	private clearSets(){
		this.blocklist.clear();
		this.joinlist.clear();
	}

	//clearSets...?
	clearUser(){
		this.clearSets();
		this.blocklist = null;
		this.joinlist = null;
		// this.messages = null;
	}
}

interface UserStore {
	users: Map<number, User>;
	findUserById(id : number) : User;
	saveUser(id : number, user : User): void;
	findAllUser() : User[];
}

@Injectable()
export class ChatUserStoreService implements UserStore{
	users = new Map();
	findUserById(id: number): User | undefined {
		return this.users.get(id);
	}

	//create user if it does not exist and return the instance. no update
	saveUser(id: number, user: User): User {
		const target = this.users.get(id);
		if (target === undefined)
		{
			this.users.set(id, user);
			return (this.users.get(id));
		}
		else
			return (target);
	}

	findAllUser(): User[] {
		return [...this.users.values()];
	}

	getNicknameById(id : number) : string | null {
		const user = this.findUserById(id);
		if (user === undefined)
			return (null);
		else
			return (user.nickname);
	}

	//TODO: 이건 안되면 through를 해야하나...? -> throw하는 방향으로
	getIdByNickname(nickname : string) : number {
		const res = this.findAllUser().find((user) => user.nickname === nickname);
		return (res ? res.id : -1);	//Error_code?	//전역 상수 어떻게 정의?	//number를 undefined로 할 수 있냐구...?ㅠㅠ
	}
}
