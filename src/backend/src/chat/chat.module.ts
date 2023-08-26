import { Global, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';
// import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { StoreModule } from 'src/chat/store/store.module';

@Module({
	imports : [
		StoreModule,
		JwtModule
	],
	providers: [
		ChatService,
		ChatGateway, 
	],
})
export class ChatModule {}
