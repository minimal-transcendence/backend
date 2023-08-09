import { Injectable } from '@nestjs/common';

export class Message {
	//속성 괜찮...?
	readonly from : number;
	readonly to : number;	//이러면 방도 숫자가 있긴 있어야하는데ㅠㅠ
	readonly body : string;
	readonly at : number;

	constructor(
		from : number,
		to : number,
		body : string
	){
		this.from = from;
		this.to = to;
		this.body = body;
		this.at = Date.now();	//필요하면 다른 포맷으로 바꾸자
	}
}

interface MessageStore{
	//id 적용 할까....?
	messages: Message[];
	saveMessage(message : Message) : void;
	findMessagesForUser(id : number) : Message[];
}

@Injectable()
export class ChatMessageStoreService implements MessageStore {
	messages = [];
	saveMessage(message: Message): void {
		this.messages.push(message);
	}
	findMessagesForUser(id: number): Message[] {
		return this.messages.filter(
			({ from, to }) => from === id || to === id
		);
	}
}
