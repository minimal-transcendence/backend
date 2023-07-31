import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { UserAuthModule } from 'src/user-auth/user-auth.module';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
// import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(()=>AuthModule),
    HttpModule,
    UserAuthModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //       secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    //       signOptions: {
    //           expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    //       },
    //   }),
    //   inject: [ConfigService],
    // }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
          expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
      },
    }),
  ],
  providers: [
    // ConfigService,
    TwoFactorAuthService,
    AuthService,
    PrismaService,
  ],
  controllers: [TwoFactorAuthController],
  exports: [TwoFactorAuthService]
})
export class TwoFactorAuthModule {}
