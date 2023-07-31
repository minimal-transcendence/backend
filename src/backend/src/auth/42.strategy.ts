import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private UserAuthService: UserAuthService,
        ) {
        super({
         authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: 'u-s4t2ud-4631b5b2652ba11a2c6e59c9aa1af6cccac9f57a517268a67905021469417ec6',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/auth/callback',
        });
    }

    async validate(accessToken: string, refreshToken: string) {
        console.log('42API accessToken: ', accessToken);
        console.log('42API refreshToken: ', refreshToken);

        const req = this.httpService.get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        try {
            const { data } = await lastValueFrom(req);
            const found = await this.UserAuthService.findUserById(data.id);
            if (found) {
                return found;
            }

            const user = await this.prisma.user.create({
                data: {
                    id: data.id,
                    email: data.email,
                }
            })

            
            return user;
        } catch (error) {}

        throw new UnauthorizedException();
    }
}
