export type Mode = {
	paddle : number;
	speed : number;
}

export type ChallengeInfo = {
	from : string;
	to : string;
	paddlemode : number;
	speedmode : number
}
//random match queue
//Map<number, array?> 먼저 Map<number, number> 로?
//Map으로 했을 때 단점 -> 순서가 꼬이면 update된다... node는 싱글스레드라지만... 과연 겹치는 경우가 없다고 할 수 있을까?
