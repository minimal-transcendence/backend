import { Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	// OnGatewayDisconnect,
	// OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	// WsResponse
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

// export type objectRoom

//cookie도 보낼 수 있다...!
//credential 설정 가능.... Rel. CORS header
@WebSocketGateway({
	// cors: {
	// 	origin: ['http://localhost:80'], (?)
	// },
	pingInterval : 5000,	//5초마다 확인
	pingTimeout : 3000,		//3초 지나면 disconnect -> disconnect시 alarm?
})
export class ChatGateway
	implements OnGatewayConnection//, OnGatewayInit, OnGatewayDisconnect
{
	//이렇게 하는거랑 httpServer 씌우는거 무슨 차이지...?
	@WebSocketServer()
	server : Server;

	private logger = new Logger('Gateway');

	//connection_error 어디서 처리...?
	// afterInit(){
	// 	this.server.on('create-room', (room) => {
	// 		//
	// 		this.logger.log(`"Room: ${ room }" 이 생성되었습니다.`);
	// 	})
	// }
	
	//socket 연결 시
	//들어온 유저에게 존재하는 모든 채팅방 목록 보내기
	//** two different browser tabs will have two different IDs ** -> 어떻게 해결?
	//socket handshake에서 query, header, auth 등 사용가능

	setNickname(@ConnectedSocket() socket: Socket, nickname : string){ socket.data.nickname = nickname }	//이게 맞나...?
	countRoom(roomName : string) : number {
		return this.server.sockets.adapter.rooms.get(roomName)?.size;
	}

	getRooms() : object {
		const {
			sockets: {
				adapter : { sids, rooms },
			},
		} = this.server;
		const roomList = [];
		console.log(rooms.size);
		console.log(sids.size);
		rooms.forEach((element, key) => {
			// console.log(`_[0] : ${_.values()[0]}, _[1] : ${_[1]}, ${key}, ${sids.get(key)}, `);
			console.log(`${element}, ${key}`);
			const thisArray = sids.get(key);
			console.log(`my array: ${thisArray}`);
			thisArray.forEach((element) => {
				console.log(element);
			});
			console.log(`my array end`);
			if (sids.get(key) === undefined){
				roomList.push(key);
			}
			console.log(roomList);
		});
		return roomList;
	}

	handleConnection(@ConnectedSocket() socket: Socket) {
		console.log(this.server.engine.clientsCount);
		socket.data.nickname = "Anonymous";	//or how can you get given nickname?
		console.log("default nick : " + socket.data.nickname);
		socket.on("enter_room", (roomName, nickname, done) => {
			socket.join(roomName);
			// done();	//done?
			this.setNickname(socket, nickname);
			socket.to(roomName).emit("welcome", socket.data.nickname, this.countRoom(roomName));	//감지되지 않음
			console.log("after nick : " + socket.data.nickname);
			this.server.sockets.emit("update_rooms", this.getRooms());
		})
	}
	
	//socket 중단 시
	//user일 때 -> 들어간 모든 채팅방에서 나가기
	//room 은 자동으로 관리?
	// 클라이언트 비정상 종료? : 브라우저 강제종료 & 하드웨어 강제종료 시 감지 못 함
	// handleDisconnect(@ConnectedSocket() socket: Socket) {

	// }

	@SubscribeMessage('ClientToServer')
	async handleMessage(
		@MessageBody() data : unknown,
		@ConnectedSocket() client : Socket
	) {
		console.log(data);
		client.emit('ServerToClient', data);
		this.server.emit('ServerToClient', "we have new client!");
	}
}
