import { Injectable } from '@nestjs/common';

export class Message {
	readonly from : number;
	readonly body : string;
	readonly at : number;

	constructor(
		from : number,
		body : string
	){
		this.from = from;
		this.body = body;
		this.at = Date.now();
	}
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
