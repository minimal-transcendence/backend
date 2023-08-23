import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';
// import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { StoreModule } from 'src/store/store.module';
import { PrismaService } from 'src/prisma.service';

@Module({
	imports : [
		StoreModule,
		JwtModule
	],
	providers: [
		ChatService,
		ChatGateway, 
		// JwtGuard,
		PrismaService
	],
})
export class ChatModule {}
