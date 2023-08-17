import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { PrismaService } from './prisma.service';
import { UserServiceModule } from './user/user.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    AuthModule,
    TwoFactorAuthModule,
    UserServiceModule,
    MatchModule,
    ChatModule,
    StoreModule,
  ],
  // imports: [ConfigModule.forRoot(), AuthModule, UserAuthModule, TwoFactorAuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
