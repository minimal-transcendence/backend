import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export class Gamer {
	// id : number;
	nickname : string;
	isGaming : boolean;
	isInQueue : boolean;

	constructor(
		nickname : string,
		isGaming? : boolean,
		isInQueue? : boolean
	){
		this.nickname = nickname;
		this.isGaming = isGaming? isGaming : false;
		this.isInQueue = isInQueue? isInQueue : false;
	}
}

interface gamerStore {
	gamers : Map<number, Gamer>

	findGamerById(id : number) : Gamer;
	saveGamer(id : number, gamer : Gamer) : Gamer;
	// findAllGamer() : Gamer[];	//필요함?
	// getGamerNameById(id : number) : string;
	// getGamerIdByName(nickname : string) : number; 
}

@Injectable()
export class GameStoreService implements gamerStore{
	gamers = new Map();
	randomMatch = [];
	//다른 큐가 필요할까?

	findGamerById(id : number): Gamer {
		return this.gamers.get(id);
	}

	//이미 있는 유저의 경우에는 업데이트 없이 반환
	saveGamer(id : number, gamer : Gamer) : Gamer {
		const target = this.gamers.get(id);
		if (target === undefined){
			this.gamers.set(id, gamer);
			return (this.gamers.get(id));
		}
		else
			return (target);
	}

	//mode는 boolean 이 아닐 수 있다.
	handleOneVsOneApply(io : Server, to : number, mode : boolean){
		//1. 일단 이 namespace에 유저가 있는지 찾는다 -> 게임중이면 게임중인 유저에게는 신청할 수 없습니다.
		//2. 없으면? -> 이제 chat namespace에서 유저를 찾아서 apply를 보내야 함...
			//접속중
				// 모든 소켓에다가 신청을....? ...? 해야하나요? TODO
			//안 접속 중 -> 현재 오프라인 상태입니다. 
	}

	//alert가 가는 경우
	//1. 게임 중인 유저에게는 신청할 수 없습니다.
	//2. 유저가 현재 오프라인 상태입니다. (신청할 수 없음)
	sendAlert(){}
}
