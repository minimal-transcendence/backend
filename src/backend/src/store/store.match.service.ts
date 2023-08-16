import { Injectable } from '@nestjs/common';
import { Mode } from 'src/game/game.types';

export class Match {
	player1Id : number;
	// player1SocketId : string;
	player2Id : number;
	// player2SocketId : string;
	mode : number;	//or just number	//줄곧 저장할 필요가 있을까?
	constructor(player1Id : number, player2Id : number, mode : number){
		this.player1Id = player1Id;
		this.player2Id = player2Id;
		this.mode = mode;
	}
}

//id를 부여할지...?
export class Challenge {
	from : number;
	to : number;
	constructor (from : number, to : number){
		this.from = from;
		this.to = to;
	}
}

//string as a roomname(number로 관리할 수도 있음)
//socket id 굳이 필요없을지도 어차피 room에 알려주는거니까
interface MatchStore {
	games : Map<string, Match>;
	findMatchByRoomname(roomname : string) : Match ;
	//playerId가 아니라 nick을 저장해도 되지 않을까...? game중에 nickname이 얼마나 바뀐다고..
	registerNewMatch(player1Id : number, player2Id : number, mode : number) : Match;
	//getAllMatch 할 필요?
}

interface ChallengeStore {
	challenges : Map<Challenge, number>	//생각해보니 map이 더 맞는거 아닌가? 같은 유저한테 여러번 할 수 없다면???
						//삽입은 차치하고 중간에 빠져야 하는 경우도 생각하면.... map이 더 맞는 것 같다.
	getAllChallengeBySender(from : number) : Challenge[];
	getAllChallengeByReceiver(to : number) : Challenge[];
	saveNewChallenge(id : number, from : number, to: number, mode : number) : void;
	getChallengeById(id : number) : Challenge;
}

interface RandomQueue {
	queue : Map<number, number[]>	//이게 맞아...? 아니면 Map<number, User> 정도는 해줘야하나...? or Map<number, number[]>도 가능
	getFirstComerByMode(mode : number) : number;
	waitByMode(mode : number, userid : number) : void;
}

@Injectable()
export class GameMatchStoreService implements MatchStore, ChallengeStore, RandomQueue{
	games = new Map();
	challenges = [];
	queue = new Map();

	findMatchByRoomname(roomname: string): Match {
		return this.games.get(roomname);
	};

	registerNewMatch(
		player1Id: number,
		// player1SocketId : string,
		player2Id: number,
		// player2SocketId : string,
		mode: number
		): Match {
		this.games.set(`$${player1Id}${player2Id}`, new Match(player1Id, player2Id, mode));
		return this.games.get(`$${player1Id}${player2Id}`);
	}

	getAllChallengeBySender(from: number): Challenge[] {
		const res = [];
		this.challenges.forEach((match) => {
			if (match.from === from)
				res.push(match);
		})
		return (res);
	}

	getAllChallengeByReceiver(to: number): Challenge[] {
		const res = [];
		this.challenges.forEach((match) => {
			if (match.to === to)
				res.push(match);
		})
		return (res);
	}

	//id가 꼭 필요할지 다시 생각해보자...
	saveNewChallenge(from: number, to: number, mode: number): void {
		const length = this.challenges.length;
		const id = length === 0? 0 : this.challenges[length - 1].id + 1;
		this.challenges.push(new Challenge(id, from, to, mode));
	}

	//으음
	getChallengeById(id: number): Challenge {
		const res = this.challenges.find(challenge => challenge === id);
		return (res);
	}
}
