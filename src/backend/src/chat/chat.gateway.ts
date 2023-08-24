import { Logger, UseGuards, Req } from '@nestjs/common';
import {
  ConnectedSocket,
  // MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  // SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { ChatRoomStoreService, Room } from '../store/store.room.service';
import { ChatUserStoreService, User } from '../store/store.user.service';
import { ChatMessageStoreService } from '../store/store.message.service';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

//TODO : 아직 인증 처리가 완전하지 않아서 새로고침을 했을 때, 혹은 jwtToken이 만료 되었을때... 같은 유저가 하나는 user99, 하나는 null로 찍힌다ㅠ 인증이 정상적으로 이루어지고 나서도 이렇게 되는지 확인할 것
// @UseGuards(JwtGuard) //guard해도 연결 자체가 막히지는 않는 듯... ㄸㄹㄹ
@WebSocketGateway(3002, {
  cors: 'http://localhost',
  // namespace : '/chat',
  pingInterval: 5000,
  pingTimeout: 3000,
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private storeRoom: ChatRoomStoreService,
    private storeUser: ChatUserStoreService,
    private storeMessage: ChatMessageStoreService,
    private chatService: ChatService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('EventsGateway');

  //아니면 여기서 prisma 써서 userlist 다 가져오게 할까...?
  //여기서 async써도 괜찮은가...?
  //TODO : 아니 생각해보니.... 이거 validation 어떻게...?
  async afterInit() {
    this.logger.log('웹소켓 서버 초기화 ✅');

    //DB의 모든 유저를 등록한다
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
      },
    });
    users.forEach((user) => {
      this.storeUser.saveUser(user.id, new User(user.id, user.nickname));
    });
    this.storeUser.saveUser(-1, new User(-1, 'Server_Admin'));
    this.storeRoom.saveRoom('DEFAULT', new Room(-1)); //owner id = -1 as server
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client Connected : ${client.id}`);
    console.log('query!!', JSON.stringify(client.handshake.query, null, 2));
    /* Authentification */
    // console.log(this.storeUser.findAllUser());
    // const userId = await this.chatService.clientAuthentification(client);
    client.data.id = client.handshake.query.id;
    client.data.nickname = client.handshake.query.nickname;
    const userId = client.data.id;
    console.log('here');
    console.log(userId, client.data.nickname);

    //TODO : 아니 생각해보니까 이때도 유 저가 이미 들어있던 방들에게 유저가 돌아왔다는 걸 통보해야 한다...!
    // console.log("new connection");
    // const thisUser = this.storeUser.findUserById(userId);
    // console.log(`found user : ${JSON.stringify(thisUser)}`);
    // console.log(client.id);
    client.onAny((any) => {
      console.log(any);
    });

		/* Initialize */
		//유저가 원래 DB에 있던 유저가 아니면 추가
		//그 default room과 dm room에 각각 join후 필요한 정보 emit(각 소켓 별)
		await this.chatService.newUserConnected(this.server, client, userId, client.data.nickname);
		
		client.on("sendChatMessage", (to, body) => {
			console.log("i got it!")
			this.chatService.sendChat(this.server, client, to, body);
		});
		// this.chatService.sendChat(this.server, client, "DEFAULT", "I'm coming");
		// this.chatService.makeCurrRoomInfo("DEFAULT");

		client.on("selectRoom", (room) => {
			//async await 어렵다 어려워
			this.chatService.userJoinRoom(this.server, client, room);
		});

		//TODO : 무조건 password 넣는 단계가 분리되면 userJoinRoom함수 자체를 좀 더 효율적으로 정비 가능
		client.on("sendRoomPass", (room, password) => {
			this.chatService.userJoinRoom(this.server, client, room, password);
		});

		client.on("setRoomPass", (room, password) => {
			this.chatService.setPassword(this.server, client, room, password);
		})

		//TODO : 미완성
		client.on("sendRoomLeave", (room) => {
			this.chatService.userLeaveRoom(this.server, client.data.id, room);
			this.chatService.userLeaveRoomAct(this.server, client, room);
		});

    //TODO : check
    client.on('blockUser', (user) => {
      this.chatService.blockUser(this.server, client, user);
    });

    client.on('unblockUser', (user) => {
      this.chatService.unblockUser(this.server, client, user);
    });

    client.on('kickUser', (roomname, user) => {
      const targetId = this.storeUser.getIdByNickname(user);
      const room = this.storeRoom.findRoom(roomname);
      if (
        this.chatService.checkActValidity(client, roomname, client.data.id, targetId)
      ) {
        this.chatService.kickUser(this.server, roomname, targetId);
      }
    });

    client.on('banUser', (roomname, user) => {
      const targetId = this.storeUser.getIdByNickname(user);
      const room = this.storeRoom.findRoom(roomname);
      if (
        this.chatService.checkActValidity(client, roomname, client.data.id, targetId)
      ) {
        this.chatService.banUser(this.server, roomname, targetId);
      }
    });

    client.on('muteUser', (roomname, user) => {
      const targetId = this.storeUser.getIdByNickname(user);
      const room = this.storeRoom.findRoom(roomname);
      if (
        this.chatService.checkActValidity(client, roomname, client.data.id, targetId)
      ) {
        this.chatService.muteUser(this.server, client, roomname, targetId);
      }
    });

    //checkValidity에서 operator가 owner를 operator로 등록하려고 할 때도 에러가 날 것
    //에러처리할 때 고려해야 한다.
    client.on('addOperator', (roomname, user) => {
      const targetId = this.storeUser.getIdByNickname(user);
      const room = this.storeRoom.findRoom(roomname);
      if (
        this.chatService.checkActValidity(client, roomname, client.data.id, targetId)
      ) {
        // client.emit("sendAlert", "[ NOTICE ]", `Add ${user} to the Operator`);
        room.addUserToOperators(targetId);
        this.server.to(roomname).emit("sendCurrRoomInfo", this.chatService.makeCurrRoomInfo(roomname));
      }
    });

    //TODO : 이거는 validityCheck가 따로 필요한 것 같은데?
    //1. owner만 operator 해제가 가능한지
    //2. operator도 operator를 해제할 수 있는지 논의 필요
    client.on('deleteOperator', (roomname, user) => {
      const targetId = this.storeUser.getIdByNickname(user);
      const room = this.storeRoom.findRoom(roomname);
      if (
        this.chatService.checkActValidity(client, roomname, client.data.id, targetId)
      ) {
        // client.emit("sendAlert", "[ NOTICE ]", `Delete ${user} to the Operator`);
        room.deleteUserFromOperators(targetId);
        this.server.to(roomname).emit("sendCurrRoomInfo", this.chatService.makeCurrRoomInfo(roomname));
      }
    });

    client.on('requestAllRoomList', () => {
      const roomInfo = this.chatService.getAllRoomList(client.data.id);
      client.emit('sendRoomList', roomInfo);
    });

    client.on('requestMyRoomList', () => {
      const roomInfo = this.chatService.getUserRoomList(client.data.id);
      client.emit('sendRoomList', roomInfo);
    });

    client.on('requestSearchResultRoomList', (query) => {
      const roomInfo = this.chatService.getQueryRoomList(query);
      client.emit('responseRoomQuery', roomInfo);
    });

    client.on('requestRoomMembers', (roomname) => {
      const roomMembers = this.chatService.makeRoomUserInfo(roomname);
      client.emit('sendRoomMembers', roomMembers);
    });

    //여기 뭔가 event emit이 필요한지 의논할 것...
    //sendAlert 외에 말이다...
    client.on('changeNick', (newNick) => {
      const user = this.storeUser.findUserById(client.data.id);
      user.nickname = newNick; //중복 확인은 여기서 하지 않는다... db에서 한다...
      client.emit(
        'sendAlert',
        'Nickname Changed',
        'your nickname has successfully changed!',
      );
    });

    client.on('selectDMRoom', (username) => {
      console.log(username);
      console.log(client.data.nickname);
      const DMs = this.chatService.makeDMRoomMessages(
        client.data.nickname,
        username,
      );
      console.log(JSON.stringify(DMs));
      this.chatService.emitEventsToAllSockets(
        this.server,
        client.data.id,
        'sendDMRoomInfo',
        username,
        DMs,
      );
    });
    client.on('sendDirectMessage', (to, body) => {
      const fromId = client.data.id;
      const toId = this.storeUser.getIdByNickname(to);
      this.chatService.fetchDM(this.server, fromId, toId, body);
    });
	client.on('setRoomPrivate', (roomname) => {
		this.chatService.setRoomStatus(this.server, client, roomname, true);
	})
	
	client.on('setRoomPublic', (roomname) => {
		this.chatService.setRoomStatus(this.server, client, roomname, false);
	})
  }


  //disconnecting, disconnect 둘다 감지 가능?
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(client.data.nickname + '나감');
    await this.chatService.disconnectUser(this.server, client.data.id);
  }
}
