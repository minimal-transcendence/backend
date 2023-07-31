import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UserAuthService, PrismaService],
  exports: [UserAuthService]
})
export class UserAuthModule {}
