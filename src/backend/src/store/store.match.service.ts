import { Injectable } from '@nestjs/common';

//Match랑 Challenge랑 머선 차이죠 -> match는 방에, challenge는 1:1 신청에? 하지만 정보가 같다...!
export class Match {
	player1Id : number;
	// player1SocketId : string;
	player2Id : number;
	// player2SocketId : string;
	mode : number;	//or just number	//줄곧 저장할 필요가 있을까?
	// constructor(player1Id : number, player2Id : number, paddlemode : number, speedmode : number){
	constructor(player1Id : number, player2Id : number, mode : number){
		this.player1Id = player1Id;
		this.player2Id = player2Id;
		this.mode = mode;
	}
	// convertMode(paddlemode : number, speedmode : number) : number {
	// 	return (paddlemode + speedmode * 3);
	// }
}

// //id를 부여할지...?
export class Challenge {
	// id : number;
	from : number;
	to : number;
	mode : number;
	constructor (id : number, from : number, to : number, mode : number){
		// this.id = id;
		this.from = from;
		this.to = to;
		this.mode = mode;
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
	challenges : Challenge[];	//생각해보니 map이 더 맞는거 아닌가? 같은 유저한테 여러번 할 수 없다면???
	getAllChallengeBySender(from : number) : Challenge[];
	getAllChallengeByReceiver(to : number) : Challenge[];
	saveNewChallenge(id : number, from : number, to: number, mode : number) : void;
	findChallengeByPair(from : number, to : number) : Challenge;
	popChallengeByPair(from : number, to : number) : Challenge;
}

interface RandomQueue {
	queue : Map<number, number>
	// queue : Map<number, number[]>	//이게 맞아...? 아니면 Map<number, User> 정도는 해줘야하나...? or Map<number, number[]>도 가능
	getFirstComerByMode(mode : number) : number;
	saveInQueueByMode(mode : number, userid : number) : void;
	removeFromQueueByMode(mode : number) : void;
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

	//으음.... to / from이 반대 방향인 것도 찾아줄건가...? 그게 좋을 것 같다...
	//CHECK : null로 return 하기 vs undefined로 return하기
	//CHECK : array로 return되는지?
	//꼭... splice를 해야하는지..? 필요한 상황이 있고 안 필요한 상황이 있는데...
	findChallengeByPair(from : number, to : number): Challenge {
		// const res = this.challenges.find(challenge => challenge === id);
		const index = this.challenges.findIndex(
			(data) => (data.from === from && data.to === to) ||
					(data.from === to && data.to === from));
		if (index === -1)
			return (undefined);
		else {
			// return (this.challenges.splice(index, 1)[0]);
			return (this.challenges)[index];
		}
	}
	
	popChallengeByPair(from : number, to : number) : Challenge {
		const index = this.challenges.findIndex(
			(data) => (data.from === from && data.to === to) ||
					(data.from === to && data.to === from));
		if (index === -1)
			return (undefined);
		else {
			return (this.challenges.splice(index, 1)[0]);
		}
	}

	//없으면? undefined
	getFirstComerByMode(mode: number): number {
		return(this.queue.get(mode));
	}

	saveInQueueByMode(mode: number, userid: number): void {
		this.queue.set(mode, userid);
	}

	//get하고 없애는게 좋을 듯
	removeFromQueueByMode(mode: number): void {
		this.queue.delete(mode);
	}
}
