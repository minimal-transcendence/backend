import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtPayload } from './types';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    // private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh_token;
        },
      ]),
      // secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: any): Promise<JwtPayload> {
    const refreshToken = req.cookies?.refresh_token;
    // return await this.authService.getUserIfRefreshTokenMatches(
    //     refreshToken,
    //     payload.id,
    // );

    const user = await this.authService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.id,
    );

    if (user) {
      return ({
        id: payload.id,
        email: payload.email
      });
    }
  }
}
