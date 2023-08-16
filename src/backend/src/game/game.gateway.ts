import { ConnectedSocket, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { ChatGateway } from 'src/chat/chat.gateway';
import { GameService } from './game.service';


//@UseGuards(JwtGuard)
@WebSocketGateway(3002, {
	cors : {
		origin : 'http://localhost'
	},
	namespace : '/game',
	pingInterval : 5000,
	pingTimeout: 3000
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection{

	@WebSocketServer() 
	server : Namespace;
		
	// chatNamespace: Namespace;
	constructor (
		private gameService : GameService,
	){}
	chatNamespace : Namespace;
	
	async afterInit(io : Server) {
		this.chatNamespace = io.of("chat")
		// this.chatNamespace = server.of('chat');
		// console.log('io : ' + JSON.stringify(io));
	}

	async handleConnection(io : Server, @ConnectedSocket() client: Socket) {
		console.log("hello i'm game user!");
		// this.chatGateway.server.emit("sendChatMessage", "game", "hihi");
		this.chatNamespace.emit("sendMessage", "game", "hihi");
		// this.gameService.sendMessage("sendChatMessage", "chat chat chat")
		io.of("/chat").emit("sendChatMessage", "hihi gamer");
		client.emit("gameHello", "hello gamer!");
	}
/*
	일단 생각해보자.... game 은 어느시점에 들어오게 되지?
	// Game소켓으로 접속 지점
		1. 1:1 매치 신청
		2. 랜덤 매치 신청
	//신청
	//이 시점에 상대방의 승낙을 기다리는 중입니다 <- 화면으로 넘어가는게 적절하지 않을까? 이 다음에 게임화면으로 넘어옴 (대기화면 1)
		상대가 이미 게임 중 -> 게임 중인 상대에게는 매치를 신청할 수 없습니다 (알람)
		상대방에게 신청이 온 것을 알림 : 수락하시겠습니까? -> 예 / 아니오
			//상대방 수락 시 : Are you Ready? -> 카운트 다운
			//상대방 거절 시 : 상대방이 신청을 거절하였습니다 -> (승낙대기 화면 해제)
	
	//랜덤매치의 경우도 마찬가지로 대기화면? or 화면 상단에 매칭 대기 중입니다 < 표시?
	//랜덤 큐에 있다가 신청 된 경우 : OO님과의 게임이 곧 시작됩니다!
		<- 수락 / 거절 기능을 줄 것인가?
			//줄 경우 : 거절당한 사람은 다시 큐의 끝에? 아님 그래도 앞에 밀어넣어 줄 것인가? -> 귀찮으니까 관두자
		// 포기하고 나가기 / 카운트 다운 후 게임 시작
	//일단 카운트 다운에 들어간 팀은 큐에서 빠져나가야겠지?
	
	//게임 시작
		//게임 중 "포기하고 나가기" or
		//게임 끝 : 작용이 어떻게 되지? 클라이언트가 나에게 패한걸 알려주나?? --> DB에 기록

		//paddle move
		//ball move
	//한 판 더 하시겠습니까? <- 네 / 아니오 : 거절해도 패하지 않게 처리 & 시간 지나면 자동으로 게임 수락 (랜덤매치 승낙/거절에도 쓸 수 있는 듯?)
	//여기서 더 게임이 진행되지 않으면? 게임 소켓에서 접속 종료 -> 자동으로 채팅 화면으로 돌아가기

	//큐를 두 개 쓰는게 안전할지도
	//유저 정보는 chat에 있는거 갖다쓸 수 있나...? namespace 분리하려면 안 하는게 좋을 것 같음
	//여기서 유저한테 필요한 정보...? id ... ? 화면에 뿌려주려면 승률 랭킹 아래 정도로 표시하자 그럼 안 심심할듯!
	//player 1
	//YSUNGWON
	//99.9%
	//RANK 1
*/


  @SubscribeMessage('oneVsOneApply')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
  

//   @SubscribeMessage('test')
//   sendMsgToChat(client: any): void {
    
//   }
  
}
