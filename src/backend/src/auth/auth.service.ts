import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import * as bcrypt from 'bcrypt';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
    constructor(
        // private configService: ConfigService,
        private jwtService: JwtService,
        private UserAuthService: UserAuthService,
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

    async generateAccessToken(user: any): Promise<string> {
        const payload = {
            id: user.id,
            username: user.username,
        }
        return await this.jwtService.signAsync(payload);
    }

    async generateRefreshToken(user: any): Promise<string> {
        const payload = {
            id: user.id
        }
        return await this.jwtService.signAsync({id: payload.id}, {
            // secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            // expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
        });
    }

    async getHashedRefreshToken(refreshToken: string) {
        // 토큰 값을 그대로 저장하기 보단, 암호화를 거쳐 데이터베이스에 저장한다. 
        // bcrypt는 단방향 해시 함수이므로 암호화된 값으로 원래 문자열을 유추할 수 없다. 
        const saltOrRounds = 10;
        const hashedRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
        return hashedRefreshToken;
      }

    // async refresh(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    async refreshJwtToken(refreshTokenDto: any): Promise<{ accessToken: string }> {
        const { refresh_token } = refreshTokenDto;
    
        // Verify refresh token
        // JWT Refresh Token 검증 로직
        // const decodedRefreshToken = this.jwtService.verify(refresh_token, { secret: process.env.JWT_REFRESH_SECRET });
        const decodedRefreshToken = await this.jwtService.verifyAsync(
            refresh_token,
            {
                secret: process.env.JWT_REFRESH_TOKEN_SECRET,
                // secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
    
        // Check if user exists
        const userId = decodedRefreshToken.id;
        
        // Get user information by refresh_token and userId
        // const payload = await this.userService.getUserIfRefreshTokenMatches(refresh_token, userId);

        // FOR TEST
        const user = await this.UserAuthService.getUserIfRefreshTokenMatches(refresh_token, userId);

        if (!user) {
          throw new UnauthorizedException('Invalid user!');
        }
    
        // Generate new access token
        const accessToken = await this.generateAccessToken(user);
    
        return {accessToken};
    }

    
}
