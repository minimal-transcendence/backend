import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import { Request } from 'express';
import { User } from '@prisma/client';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    // private readonly configService: ConfigService,
    private readonly UserAuthService: UserAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.access_token;
        },
      ]),
      // secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any): Promise<User> {
    return await this.UserAuthService.findUserById(payload.id);
  }
}
