import { Logger, UseGuards } from '@nestjs/common';
import {
	ConnectedSocket,
	// MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	// SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
// import { ChatRoomStoreService } from './store/store.room.service';
import { ChatUserStoreService, User } from './store/store.user.service';
import { ChatMessageStoreService } from './store/store.message.service';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma.service';

@UseGuards(JwtGuard)	//guard해도 연결 자체가 막히지는 않는 듯... ㄸㄹㄹ
@WebSocketGateway({
	cors: {
		origin: ['http://localhost:80'],
	},
	pingInterval : 5000,
	pingTimeout : 3000,
})
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	constructor(
		// private storeRoom : ChatRoomStoreService,
		private storeUser : ChatUserStoreService,
		private storeMessage : ChatMessageStoreService,
		private chatService : ChatService,
		private prisma : PrismaService
	){}

	@WebSocketServer()
	server : Server;
	private logger: Logger = new Logger('EventsGateway');
	//아니면 여기서 prisma 써서 userlist 다 가져오게 할까...?
	//여기서 async써도 괜찮은가...?
	async afterInit(){
		this.logger.log('웹소켓 서버 초기화 ✅');

		const users = await this.prisma.user.findMany({
			select : { 
				id : true,
				nickname : true
			}
		});
		users.forEach((user) => {
			//아아니 흑흑... 메모리 릭 체크하자... map에 든 User를 어떻게 제거하는게 원래는 맞는지...
			//일단 우리 시스템에서는 탈퇴는 없지만...!
			this.storeUser.saveUser(
				user.id, 
				new User(user.nickname)
			);
		})
	}

	//socket 연결 시 -> user, room list 갱신
	//session연결
	//message 리스트 갱신
	//socket.on
		//sendMessage
		//sendRoomPass
		//sendRoomLeave

		//join(Room)
		//switchRoom <- 근본적으로 enterRoom이랑 뭐가 다르지...? 하지만 enter_room은 예약어가 있었던 것 같다

		//changeNick
		//blockOnUser
		//blockOffUser
		//addOperator
		//deleteOperator <- owner 한테 권한 줄 것? 아니면 operator는 나갈때만 삭제 가능?
		//muteUser
		//unmuteUser
	//socket.emit
		//init
		//userConnect
		//userDisconnect
		//requireRoomPass
		
		//updateUsers
		//updateRooms -> 방 리스트 업데이트
		//updateRoom -> 방 내부에 owner 이나 operator 등 바뀌었을때
	// async handleConnection(@ConnectedSocket() client: Socket) {
	async handleConnection(@ConnectedSocket() client: Socket, userId : string) {
		this.logger.log(`Client Connected : ${client.id}`);
		
		// const userId = client.handshake.auth.userID;	//근데 근본적으로 조작(?) 하면 이런 식으로 인증하는 의미가 없다
						//최종적으로는 jwtToken으로 connection도 guard해야됨
		// if (!userId || this.storeUser.findUser(userId) === undefined)	//이게 valid한지는 어떻게 체크?
		// {
		// 	client.emit("unauthorized", "You are Unauthorized");
		// 	client.disconnect();
		// }
		//모두 너무 길다... 슬픔

		const clientId = parseInt(userId); 
		this.storeUser.findUser(parseInt(userId)).connected = true;		
		client.join(`$${userId}`);
		//persist session 필요함...? 안 필요한 것 같은데...!

		//connected -> true
		//방 리스트 불러오기 / 전달 -> this.storeRoom에 있겠지?
		//유저 리스트 불러오기 / 전달 -> this.storeUser 에 있음...
		//챗 리스트 불러오기 / 전달...?
		const messagesPerUser = new Map();	//굳이 추가로 user에 저장할 필요 있...?
		this.storeMessage
		.findMessagesForUser(clientId)
		.forEach((message) => {
			const { from , to } = message;	//private이면 이렇게 접근 못함
			const otherUser = clientId === from ? to : from;
			if (messagesPerUser.has(otherUser))
				messagesPerUser.get(otherUser).push(message);
			else
				messagesPerUser.set(otherUser, [message]);
		});

		//모든 방 리스트와 각 방의 메세지 정보들을 줘야 함....
		//결국 다시 원점인데... 방이랑 PM을 어떻게 분리하지? enum을 써야함?
		const data = [];
		this.storeUser.users.forEach((user, id) => {
			data.push({
				type: "user",
				id : id,
				nickname : user.nickname,
				connected : user.connected,
				messages : messagesPerUser.get(id) || [],
			})
		})
		//여기 storeRoom도 해줘야 함
		//그리고 데이터 전달
		//와 낭비다...!
/*		//아니면 currentRoom만 할까?	*/
		//이 경우 방 리스트 & 유저 리스트만 보내고 (block미리 거르기) currRoom 생길 때 그 방 메세지만 모아서 보내면 될 듯
		//이렇게 다 했을 때 좋은 점이 뭐가 있지? 새로운 메세지 알람....?
		//만약 다 안 보내도 된다면 -> userlist, roomlist, currMessagelist 만 보내면 된다.
		client.emit("init", { data : data , myinfo : this.storeUser.findUser(clientId) });

		client.broadcast.emit("userConnect", {
			//userid, nickname, connected! <  그냥 on off 하라고 들여보내는 것일 뿐
			//환영 메세지도 저장하고 싶으면 저장하는게 좋은가...? 싶으면서도 잘 모르겠다.
			//만약 저장할거라면 from client / to -> joinlist의 모든 방 pM은 화면 변동 없음
		})

		client.on("enter_room", (roomname) => {
			//이미 client가 들어가 있는 방인지 check -> 이미 들어간 방이면 방만 rendering. rendering 할 수 있게 방 객체와 message더미를 전달

			//안 들어간 방
				// 존재하는 가?
					// 비밀번호가 있는가?
						// pass하면 join	//여기서 client.on 한 번 더 가능? or emit require_pass?
						// pass못하면 emit("wrong_password")
				// 존재하지 않으면 방을 만든다 (비번 x가 default)
			//방을 들어간 방 목록에 추가한다
			//rendering할 수 있게 방 객체와 message더미 전달
		})

		client.on("send_message", (to, msg) => {
			//to가 존재하는지
				// 사람인지 방인지 <- 감지 가능? 1. roomname검색 -> 없으면 2. user검색
					//방이라면 들어가 있는지
						//전부 사실이라면 message기록하고 해당 방에 있는 유저들에게 emit(new_message)
					//사람이라면
						//to().to()로 emit
			//존재하지 않는다면? -> ignore? or throw error?
		})

		client.on("leave_room", (roomname) => {
			//방 찾기 (방이 아닌 사람이면 못 떠남!)->pM방은 handleDisconnect에서 처리
				//그 방의 유일한 한 사람인지? -> 맞으면 방 자체를 없앤다
					// owner인지? -> 맞으면 다른 사람을 owner & op로 임명하고 해당 유저는 해제
						//in(roomname).emit("userDisconnect")	//disconnect 가 맞겠지? ㅇㅇㅇ님이 방을 나가셨습니다 <- 이것도 message로 처리해야하나? 만약 message로 처리해야하면 저장도 하자
		})

		client.on("change_nick", (newnick) => {
			//모든 방에서 닉넴 업뎃 흑흑 이게 말이 됩니까....? client.broadcast.("updateWindow") <- 현재 창 업데이트 : user창, currRoom...
		})

		client.on("block_on", (target) => {
			//target이 blocklist 에 있는지
			//없으면 추가
				//(화면상으로는 회색 표시로 비활성화 하면 좋을 듯?) updateWindow가 아닐까?
		})

		client.on("block_off", (target) => {
			//target이 블랙리스트에 있는지
			//있으면 삭제
				//화면 업데이트
		})

	}
	
	async handleDisconnect(@ConnectedSocket() client: Socket) {
		//모든 열린 창이 닫혔는지?
		//여기다 이걸 쓰는게 맞는지 모르겠다 흑흑 안 되면 이 scope에서 빼서 쓸 것
		client.on("disconnect", async() => {
			//허허 닉네임이 중간에 바뀔 수 있단 말임...! ㅇ<-< private 방 이름을 대체 어떻게 해야하나
			const userId = this.storeUser.findUser(client.data.id);	//허허 일단 들어올 때 프로토콜을 정해야
			const connectedSockets = await this.server.in(`${userId}`).fetchSockets();	//allSockets() : deprecated
			const isDisconnected = connectedSockets.length === 0;	//fetchSockets return형태?
			if (isDisconnected) {
				//아래가 정확히 어떤 효과인지...?
				client.broadcast.emit("userDisconnected", client.data.id);
				//update the connection status of a user
				this.storeUser.findUser(client.data.id).connected = false;
			}
		})
		//들어 있는 방에서 모두 나오기 < 일단 joinlist가 있긴 하다...!
			//privateRoom -> 여기서는 그냥 상대방한테 "방을 나가셨습니다? 아니면 방 유지?"
			//normalRoom -> "유저 ㅇㅇㅇ이 방을 나갔습니다" & 각종 list와 owner 변경 & 빈 방은 제거 & 빈 방의 메세지도 제거
		//broad cast userDisconnect <- 이게 유저 ㅇㅇㅇ이 방을 나갔다 아니냐구 흑흑
	}

	@SubscribeMessage('connect')	//이건 guard가능.... 하지만 연결은 그렇게 안 된다... 흐으으으음...
	async getConnect(client: Socket, payload : any){
		console.log(payload);
		client.emit("confirm", "you are connected");
	}
	@SubscribeMessage('hello')	//이건 guard가능.... 하지만 연결은 그렇게 안 된다... 흐으으으음...
	async newComer(client: Socket, message : any){
		console.log(message);
		client.emit("hihi");
	}
}

//복잡도... 너무 높은 것 같은데 이게 맞나....?
