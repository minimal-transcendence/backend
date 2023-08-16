import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { ChatGateway } from 'src/chat/chat.gateway';
import { GameService } from './game.service';

@Module({
	imports: [
		// ChatGateway,
		ChatModule
	],
	providers: [
		GameGateway,
		GameService
	],
})
export class GameModule {}
