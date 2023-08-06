import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ChatUserStoreService } from './store/store.user.service';
import { ChatMessageStoreService } from './store/store.message.service';
import { PrismaService } from 'src/prisma.service';
// import { ChatRoomStoreService } from './store/store.room.service';

@Module({
	providers: [
		ChatService,
		ChatGateway, 
		JwtGuard,
		// ChatRoomStoreService,
		ChatUserStoreService,
		ChatMessageStoreService,
		PrismaService
	],
//   controllers: [ChatController]
})
export class ChatModule {}
