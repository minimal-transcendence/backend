import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController, avatarController } from './user.controller';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ChatModule } from 'src/chat/chat.module';
import { StoreModule } from 'src/chat/store/store.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';

@Module({
	imports: [
		ChatModule,
		StoreModule,
		JwtModule
	],
	controllers: [UserController, avatarController],
	providers: [
		UserService,
		PrismaService,
		JwtGuard,
		ChatGateway,
		ChatService
	],
	exports: [UserService]	//
})
export class UserModule {}
