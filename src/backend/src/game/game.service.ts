import { Injectable } from '@nestjs/common';
import { Namespace, Server } from 'socket.io';

//chat과는 완전히 socket이 분리된다고 생각하고 짜자
@Injectable()
export class GameService {
	chatNamespace : Namespace;

	// initialize(server : Server){
	// 	this.chatNamespace.server.of("/chat");
	// }

	// sendMessage(eventName: string, data: any) {
	// 	this.chatNamespace.emit(eventName, data);
	// }
	/*
	//user 필요한 정보
	//id, nickname, isGaming, //화면단에 필요하다면 전적 관련 정보들 -> prisma
	//socket이 끊어지면? <- 유저 정보에서도 삭제? 새로고침시? 큐에 없거나 게임을 하지 않아도 접속 가능?
	//game에서 창마다 같은 상태값으로 관리할 필요있을까? -> 상태는 관리, 화면은 안 관리
	
	//Types :
		//1. User : 어쩌구저쩌구 상태
		//2. Room? : player1 player2 공 위치? <- 저장해야함?
		//3. challenge : 신청자 id, 신청 상대 id, 신청 mode
		//4. random matching queue : 신청자 id, 신청 mode <- 3, 4는 통합 가능할듯
		//5. paddleInfo (???)
		//6. ballInfo (x : number, y : number, score? : number)
	*/
}
