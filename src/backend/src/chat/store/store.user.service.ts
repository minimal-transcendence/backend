import { Injectable } from '@nestjs/common';
import { Message } from './store.message.service';

//만약 유저가 이름을 바꾼다면.... <- 항상 고려할 사항
export class User {
	id : number;	//어차피 map에 있을건데 여기 있을 필요있...? -> 편의!
	nickname : string;	//as nickname? or will you give me a chance to change nickname?
		//만약 nick으로 하면 바꿀 때를 구현하기 힘들 것 같다...
		//아니면 이전까지 기록을 싹 갈아치운 다음에 이걸 가는 것도 가능할 것 같기도?
	blocklist : Set<number>;	//이건 client Local 에서 관리한다...! 그래도 일단 저장
	connected : boolean;
	isGaming : boolean;
	//들어간 방 모두 가지고 있어야 하나?
	joinlist : Set<string>; // <-  이것도 이제 필요 없지 않을까? 아니야... 일단 저장하자
	currentRoom : string;
	messages : Map<number, Message[]>;

	constructor(id : number, nickname : string){
		this.id = id;
		this.nickname = nickname;
		this.blocklist = new Set();
		this.connected = true;	//접속했을 때 불러오니까!
		this.isGaming = false;
		this.joinlist = new Set();	//default방... 하지만 이건 어차피 enterRoom method로 감쌀 것것 
		this.messages = new Map();
		// this.currentRoom = "Default";	//얘도 enterroom이 처리할 것 같다
	}

	//서버에서 관리가 필요할까?
	addUserToBlocklist(userid : number){
		this.blocklist.add(userid);
	}
	//서버에서 관리가2
	deleteUserFromBlockList(userid : number){
		this.blocklist.delete(userid);	//없는 경우 뭔가 조치 필요?
	}

	addRoomToJoinlist(roomname : string){
		this.joinlist.add(roomname);
	}

	deleteRoomFromJoinList(roomname : string){
		this.joinlist.delete(roomname);
	}

	//getter는 필요없음
	private clearSets(){
		this.blocklist.clear();
		this.joinlist.clear();
	}

	//prevent memory leaks ... 맞을까...? chatGPT 신뢰 가능...?
	clearUser(){
		this.clearSets();
		this.blocklist = null;
		this.joinlist = null;
		this.messages = null;	//?
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
		//못 찾으면 undefined
		return this.users.get(id);
	}

	//유저가 없으면 만들고 있으면 원래 있는 유저를 반환한다. update는 안됨
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
}
