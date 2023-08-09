import { Injectable } from '@nestjs/common';
import { ChatRoomStoreService } from './store/store.room.service';
import { ChatUserStoreService } from './store/store.user.service';
import { ChatMessageStoreService } from './store/store.message.service';
import { PrismaService } from 'src/prisma.service';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
	constructor(
		private storeRoom : ChatRoomStoreService,
		private storeUser : ChatUserStoreService,
		private storeMessage : ChatMessageStoreService,
		private prisma : PrismaService,
		private jwtService : JwtService
	){}

	//TODO : 유저 접속
	//-> 존재하는 유저일 때는 유저 아이디(혹은 유저 자체?)
	//존재하지 않을 때는 유저를 유저리스트에 넣는다 (혹은 유저리스트를 업데이트하는 유틸을 만들고 호출하는 것도 괜찮을 듯?)

	async clientAuthentification(client : Socket) : Promise<number> {
		
		try {
			const cookies = client.handshake.headers.cookie.split(";");

			const findAccessToken = (cookies : string[]) => {
				for (const string of cookies) {
				if (string.includes("access_token")) {
					const firstIdx = string.indexOf("=");
					const res = string.substring(firstIdx + 1);
					return res; // Return the value and exit the function
				}
				}
				return null; // Return null if not found
			};
			
			const jwtToken = findAccessToken(cookies);
			console.log("here");
			const payload = await this.jwtService.verifyAsync(jwtToken,
			{
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			});
			return (payload.id);
		} catch {
			console.log("you got error");
			// client.disconnect();
		}
	}

	//userJoinRoom
		// 방이 있는지 어쩌구...
	//userLeaveRoom
	//userLeaveRooms
	//userSendDM
	//userSendMessage
}
