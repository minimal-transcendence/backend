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
// import { GameGateway } from './game/game.gateway';
// import { GameService } from './game/game.service';
// import { GameStoreService } from './game/game.store.service';
// import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    AuthModule,
    TwoFactorAuthModule,
    UserServiceModule,
    MatchModule,
    ChatModule,
    StoreModule,
    // GameModule,
  ],
  // imports: [ConfigModule.forRoot(), AuthModule, UserAuthModule, TwoFactorAuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
