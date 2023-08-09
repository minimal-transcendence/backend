import { Injectable } from '@nestjs/common';

export class User {
	//속성 private?
	// id : number;	//어차피 map에 있을건데 여기 있을 필요있...?
	nickname : string;	//as nickname? or will you give me a chance to change nickname?
		//만약 nick으로 하면 바꿀 때를 구현하기 힘들 것 같다...
		//아니면 이전까지 기록을 싹 갈아치운 다음에 이걸 가는 것도 가능할 것 같기도?
	// blocklist : Set<number>;	//이건 client Local 에서 관리한다...!
	connected : boolean;
	isGaming : boolean;
	//들어간 방 모두 가지고 있어야 하나?
	joinlist : Set<string>;
	// currentRoom : string; <- message 전부 store하는 시점에서 필요없는 것 같음

	constructor(nickname : string){
		this.nickname = nickname;
		// this.blocklist = new Set();
		this.isGaming = false;
		this.connected = true;	//접속했을 때 불러오니까!
		this.joinlist = new Set();
	}

	// addUserToBlocklist(userid : number){
	// 	this.blocklist.add(userid);
	// }

	// deleteUserFromBlockList(userid : number){
	// 	this.blocklist.delete(userid);	//없는 경우 뭔가 조치 필요?
	// }

	addRoomToJoinlist(roomname : string){
		this.joinlist.add(roomname);
	}

	deleteRoomFromJoinList(roomname : string){
		this.joinlist.delete(roomname);
	}

	//getter는 필요없음
	clearSets(){
		// this.blocklist.clear();
		this.joinlist.clear();
	}

	//prevent memory leaks ... 맞을까...? chatGPT 신뢰 가능...?
	clearUser(){
		// this.blocklist = null;
		this.joinlist = null;
	}
}

interface UserStore {
	users: Map<number, User>;
	findUser(id : number) : User;
	saveUser(id : number, user : User): void;
	findAllUser() : User[];
}

@Injectable()
export class ChatUserStoreService implements UserStore{
	users = new Map();
	findUser(id: number): User | undefined {
		//못 찾으면 undefined
		return this.users.get(id);
	}
	saveUser(id: number, user: User): void {
		//만약 원래 있던 아이디를 넣으면 update 된다 -- 나중에 수시로 업데이트 되는 데이터에서도 괜찮은지 test
		if (this.users.get(id) === undefined)
			this.users.set(id, user);
	}
	findAllUser(): User[] {
		return [...this.users.values()];
	}

	getNicknameById(id : number) : string {
		return this.users.get(id).nickname;
	}
}
