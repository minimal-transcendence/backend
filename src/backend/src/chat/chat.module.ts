import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ChatUserStoreService } from './store/store.user.service';
import { ChatMessageStoreService } from './store/store.message.service';
import { PrismaService } from 'src/prisma.service';
import { ChatRoomStoreService } from './store/store.room.service';
import { JwtService } from '@nestjs/jwt';

@Module({
	providers: [
		ChatService,
		ChatGateway, 
		JwtGuard,
		JwtService,
		ChatRoomStoreService,
		ChatUserStoreService,
		ChatMessageStoreService,
		PrismaService
	],
//   controllers: [ChatController]
	exports: [
		ChatGateway
	]
})
export class ChatModule {}
