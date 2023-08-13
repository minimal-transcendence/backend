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

export class DM {
	readonly from : number;
	readonly to : number;
	readonly body : string;
	readonly at : number;

	constructor(
		from : number,
		to : number,
		body : string
	){
		this.from = from,
		this.to = to,
		this.body = body,
		this.at = Date.now();
	}
}

interface DMStore{
	messages: DM[];
	saveMessage(message : DM) : void;
	findMessagesForUser(from : number, to : number) : DM[];
}

@Injectable()
export class ChatMessageStoreService implements DMStore {
	messages = [];
	saveMessage(message: DM): void {
		this.messages.push(message);
	}

	//효율적일까...? 더 좋은 방법...?
	findMessagesForUser(from : number, to : number): DM[] {
		return this.messages.filter(
			({ from, to }) => ((from === from && to === to) || (from === to && to === from))
		);
	}
}
