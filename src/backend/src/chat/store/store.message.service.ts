import { Injectable } from '@nestjs/common';

export class Message {
	//속성 괜찮...?
	readonly from : number;
	// readonly to : number;	//이러면 방도 숫자가 있긴 있어야하는데ㅠㅠ
	readonly body : string;
	readonly at : number;

	constructor(
		from : number,
		// to : number,
		body : string
	){
		this.from = from;
		// this.to = to;
		this.body = body;
		this.at = Date.now();	//필요하면 다른 포맷으로 바꾸자
	}
	// clear() {	
	// }
}

//이게 최선인가... 확실해요....?	//위에 메세지랑 같이 못 쓰는 이유가 있나요...?
// export class DM {
// 	readonly from : number;
// 	readonly to : number;
// 	readonly body : string;
// 	readonly at : number;
// }

// interface MessageStore{
// 	//id 적용 할까....?
// 	messages: Message[];
// 	saveMessage(message : Message) : void;
// 	findMessagesForUser(id : number) : Message[];
// }

// @Injectable()
// export class ChatMessageStoreService implements MessageStore {
// 	messages = [];
// 	saveMessage(message: Message): void {
// 		this.messages.push(message);
// 	}
// 	findMessagesForUser(id: number): Message[] {
// 		return this.messages.filter(
// 			({ from, to }) => from === id || to === id
// 		);
// 	}
// }
