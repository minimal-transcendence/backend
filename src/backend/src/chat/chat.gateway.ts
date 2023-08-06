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
// import { AuthService } from 'src/auth/auth.service';

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
	// constructor (private readonly authService : AuthService){}	//guard는 쓸 수 없다는 이야기가 있다

	//connection_error 어디서 처리...?
	// afterInit(){
	// }
	
	//socket 연결 시
	//들어온 유저에게 존재하는 모든 채팅방 목록 보내기
	//** two different browser tabs will have two different IDs ** -> 어떻게 해결?
	//socket handshake에서 query, header, auth 등 사용가능

	setNickname(@ConnectedSocket() socket: Socket, nickname : string){ socket.data.nickname = nickname }	//이게 맞나...?
	countRoom(roomName : string) : number {
		return this.server.sockets.adapter.rooms.get(roomName)?.size;
	}

	//sids: Map<SocketId, Set<Room>>
	//rooms: Map<Room, Set<SocketId>>
	getRooms() : object {
		const {
			sockets: {
				adapter : { sids, rooms },
			},
		} = this.server;
		const roomList = [];
		rooms.forEach((_, key) => {
			if (_.has(key))
				console.log("it is " + key);
			else
				console.log("it is not" + key);

			if (sids.get(key) === undefined){	//왜 undefined?????
				roomList.push(key);
			}
		});
		//첫째 인자에 user랑 room이 둘 다
		//두번째 인자에는 userId만 있는 듯? 아니 대체 왜????
		//왜 실제로는 둘 다 첫번째 인자가 forEach 를 돌까?
		// sids.forEach((a, b) => {
		// 	console.log(`a:`);
		// 	a.forEach((sth) => {
		// 		console.log(sth);
		// 	})
		// 	console.log(`b: ${b}`);
		// })
		// //세번째 인자
		// //4번째 인자
		// rooms.forEach((c, d) => {
		// 	console.log(`c:`);
		// 	c.forEach((sth) => {
		// 		console.log(sth);
		// 	})
		// 	console.log(`d: ${d}`);
		// })
		rooms.forEach((c, d, e) => {
			console.log(c);
			console.log(d);
			console.log(e);
			// Set(1) { 'wGDDKwfSFrXGEqFzAAAB' }
			// wGDDKwfSFrXGEqFzAAAB
			// Map(2) {
			//   'wGDDKwfSFrXGEqFzAAAB' => Set(1) { 'wGDDKwfSFrXGEqFzAAAB' },
			//   'room3' => Set(1) { 'wGDDKwfSFrXGEqFzAAAB' }
			// }
			// Set(1) { 'wGDDKwfSFrXGEqFzAAAB' }
			// room3
			// Map(2) {
			//   'wGDDKwfSFrXGEqFzAAAB' => Set(1) { 'wGDDKwfSFrXGEqFzAAAB' },
			//   'room3' => Set(1) { 'wGDDKwfSFrXGEqFzAAAB' }
			// }
		})
		/*
		생각한 내용이 아니었다...!
		a:
		tNW5AmGE_lG8GZe1AAAB
		room1
		b: tNW5AmGE_lG8GZe1AAAB
		c:
		tNW5AmGE_lG8GZe1AAAB
		d: tNW5AmGE_lG8GZe1AAAB
		c:
		tNW5AmGE_lG8GZe1AAAB
		d: room1
		*/
		/*
		a:
		n0N0atO_oG_SL5TXAAAB
		room1
		room2
		b: n0N0atO_oG_SL5TXAAAB
		a:
		bBRv2kwFz4xVmldXAAAD
		room3
		b: bBRv2kwFz4xVmldXAAAD
		c:
		n0N0atO_oG_SL5TXAAAB
		d: n0N0atO_oG_SL5TXAAAB
		c:
		n0N0atO_oG_SL5TXAAAB
		d: room1
		c:
		n0N0atO_oG_SL5TXAAAB
		d: room2
		c:
		bBRv2kwFz4xVmldXAAAD
		d: bBRv2kwFz4xVmldXAAAD
		c:
		bBRv2kwFz4xVmldXAAAD
		d: room3
		*/
		return roomList;
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		/* 1. verification */
		//https://stackoverflow.com/questions/58670553/nestjs-gateway-websocket-how-to-send-jwt-access-token-through-socket-emit
		/*
		const payload = this.authService.verification{
			client.handshake.headers.authorization,
		};
		const user = await this.userService.findOnd(payload.userId);
		!user && client.disconnect();
		*/
		/* 
		https://socket.io/docs/v3/server-api/
		io.on("connection", (socket) => {
		socket.use(([event, ...args], next) => {
			if (isUnauthorized(event)) {
			return next(new Error("unauthorized event"));
			}
			// do not forget to call next
			next();
		});
		socket.on("error", (err) => {
			if (err && err.message === "unauthorized event") {
			socket.disconnect();
			}
		});
		});
		*/

		/* 2. reuse socket id & identify unique user */
		//pass 하면 manually give session id : session id 안 부여할 수는 없나?
		//https://stackoverflow.com/questions/18294620/reuse-socket-id-on-reconnect-socket-io-node-js
		
		/* 3. handle! */
		client.on("enter_room", (roomName, nickName) => {
			console.log("[1] : " + this.server.sockets.adapter.rooms.size);
			//string.startWith (아래 형식 가능) --> user와 이름이 같은 
			client.join(`#${roomName}$${roomName}`);
			console.log("[2] : " + this.server.sockets.adapter.rooms.size);
			this.getRooms();
		})

	}
	
	//socket 중단 시
	//user일 때 -> 들어간 모든 채팅방에서 나가기
	//room 은 자동으로 관리?
	// 클라이언트 비정상 종료? : 브라우저 강제종료 & 하드웨어 강제종료 시 감지 못 함
	// 누군가 접속이 끊어지면 동작
	handleDisconnect(@ConnectedSocket() socket: Socket) {
		//다른 유저의 화면 업데이트 : 채팅화면의 유저 리스트 갱신
	}

	@SubscribeMessage('ClientToServer')
	async handleMessage(
		@MessageBody() data : unknown,
		@ConnectedSocket() client : Socket
	) {
		console.log(data);
		client.emit('ServerToClient', data);	//array로 들어오는 듯?
		this.server.emit('ServerToClient', "we have new client!");
	}
}
