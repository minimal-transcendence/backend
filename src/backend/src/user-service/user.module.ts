import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtGuard],
  exports: [UserService]	//
})
export class UserServiceModule {}
