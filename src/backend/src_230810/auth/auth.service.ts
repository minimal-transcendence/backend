import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { AuthPayload } from './types';

@Injectable()
export class AuthService {
    constructor(
        // private configService: ConfigService,
        private jwtService: JwtService,
		private userService : UserService,
        private httpService: HttpService,
    ) {}

    async getApiAccessToken(code: string): Promise<string> {
        const req = this.httpService.post("https://api.intra.42.fr/oauth/token", {
            grant_type: "authorization_code",
            code: code,
            client_id: "u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3",
            client_secret: "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",
            redirect_uri: "http://localhost/callback",
            scope: "public",
        })

        const { data } = await lastValueFrom(req);

        const access_token = data.access_token;

        return access_token;
    }

    async getUserFromApi(code: string): Promise<any> {
        const tokenReq = this.httpService.post("https://api.intra.42.fr/oauth/token", {
            grant_type: "authorization_code",
            code: code,
            client_id: "u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3",
            client_secret: "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",
            redirect_uri: "http://localhost/callback",
            scope: "public",
        })

        const tokenData = await lastValueFrom(tokenReq);

        const access_token = tokenData.data.access_token;

        const userReq = this.httpService.get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const userData = await lastValueFrom(userReq);

        return userData.data;
    }

    async generateAccessToken(payload: AuthPayload): Promise<string> {

        return await this.jwtService.signAsync(
            {
                id: payload.userId,
                email: payload.email,
            },
        );
    }

    async generateRefreshToken(payload: AuthPayload): Promise<string> {
        return await this.jwtService.signAsync(
            {
                id: payload.userId,
                email: payload.email
            },
            {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
            }
        );
    }

    async getHashedRefreshToken(refreshToken: string) {
        // 토큰 값을 그대로 저장하기 보단, 암호화를 거쳐 데이터베이스에 저장한다. 
        // bcrypt는 단방향 해시 함수이므로 암호화된 값으로 원래 문자열을 유추할 수 없다. 
        const saltOrRounds = 10;
        const hashedRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
        return hashedRefreshToken;
    }

	async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User>
    {
        const user = await this.userService.findUserById(userId);

        if (!user) {
            throw new UnauthorizedException("no such user in database");
        }

        if (!user.refreshToken) {
            throw new UnauthorizedException("no refresh token on user");
        }

        const isMatched = await bcrypt.compare(refreshToken, user.refreshToken);

        if (isMatched) {
            return user;
        }
    }

    async refreshJwtToken(refreshTokenDto: any): Promise<{ accessToken: string }> {
        const { refresh_token } = refreshTokenDto;
    
        // Verify refresh token
        // JWT Refresh Token 검증 로직
        const decodedRefreshToken = await this.jwtService.verifyAsync(
            refresh_token,
            {
                secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            });
    
        // Check if user exists
        const userId = decodedRefreshToken.id;
        
        // Get user information by refresh_token and userId
        const user = await this.getUserIfRefreshTokenMatches(refresh_token, userId);
    
        // Generate new access token
        
        const payload = {
            userId: user.id,
            email: user.email,
        }
        const accessToken = await this.generateAccessToken(payload);
    
        return {accessToken};
    }

    
}
