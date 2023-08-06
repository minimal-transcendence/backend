import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController, avatarController } from './user.controller';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Module({
  controllers: [UserController, avatarController],
  providers: [UserService, PrismaService, JwtGuard],
  exports: [UserService]	//
})
export class UserServiceModule {}
