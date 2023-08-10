import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { PrismaService } from 'src/prisma.service';
import { MatchController } from './match.controller';

@Module({
  controllers: [MatchController],
  providers: [MatchService, PrismaService],
//   exports: [MatchService]
})
export class MatchModule {}
