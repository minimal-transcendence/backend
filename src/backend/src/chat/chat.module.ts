import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { StoreModule } from 'src/store/store.module';

@Module({
	imports : [
		StoreModule
	],
	providers: [
		ChatService,
		ChatGateway,
		JwtGuard,
		JwtService,
		PrismaService
	],
})
export class ChatModule {}
