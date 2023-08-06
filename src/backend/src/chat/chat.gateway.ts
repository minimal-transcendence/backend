import { Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	// MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	// SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

@WebSocketGateway({
	// cors: {
	// 	origin: ['http://localhost:80'],
	// },
	pingInterval : 5000,
	pingTimeout : 3000,
})
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect//, OnGatewayInit
{
	@WebSocketServer()
	server : Server;

	//socket 연결 시 -> user, room list 갱신
	//session연결
	//message 리스트 갱신
	//socket.on
		//sendMessage
		//sendRoomPass	<- 이거 한 번에 처리하면 좋을 것 같은데... join room으로다가... 안 되나...?
		//sendRoomLeave 
		//join(Room)

		//changeNick
		//blockOnUser
		//blockOffUser
		//addOperator
		//deleteOperator <- owner 한테 권한 줄 것? 아니면 operator는 나갈때만 삭제 가능?
		//muteUser
		//unmuteUser
	//socket.emit
		//updateWindow <- 누군가 정보 바뀌었을 때 <- 이거 하나로 가능?
		//userUpdate	-> 유저 상태 변경(온라인, 게임 중, 오프라인)
		//usersUpdate?	-> 유저 목록 변경?
		//roomUpdate -> 방 내부에 owner 이나 operator 등 바뀌었을때
		//roomsUpdate -> 방 목록 바뀌었을때?
	async handleConnection(@ConnectedSocket() client: Socket) {

	}
	
	async handleDisconnect(@ConnectedSocket() socket: Socket) {

	}
}
