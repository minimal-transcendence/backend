import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatRoomStoreService } from 'src/chat/store/store.room.service';
import { ChatMessageStoreService } from 'src/chat/store/store.message.service';
import { ChatUserStoreService } from 'src/chat/store/store.user.service';
import { ChatService } from 'src/chat/chat.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [ChatModule],
  providers: [
    GameGateway,
    GameService,
    
    ChatGateway,
    ChatRoomStoreService,
    ChatMessageStoreService,
    ChatUserStoreService,
    ChatService,
    PrismaService,
  ]
})
export class GameModule {}
