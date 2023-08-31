import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { MatchModule } from 'src/match/match.module';
import { MatchService } from 'src/match/match.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [MatchModule],
  providers: [
    GameGateway,
    GameService,
    MatchService,
    PrismaService
  ],
  exports: [GameGateway]
})
export class GameModule {}
