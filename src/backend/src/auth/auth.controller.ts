import { Controller, Get, Post, Query, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtGuard } from './guards/jwt.guard';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
		private userService: UserService
    ) {}

    @Get('login')
    async login(@Req() req: any, @Query() params: any, @Res() res: Response) {
        const code = params?.code;

        if (!code) {
            throw new UnauthorizedException('No code in query string');
        }

        console.log("Nest code:", code);

        // get user data from api
        const apiData = await this.authService.getUserFromApi(code);

        const user = await this.userService.createUser({
            id: apiData.id,
            email: apiData.email,
        });

        if (user.is2faEnabled) {
            return res.send({
                message: 'finish 2fa to get jwt token',
                is2faEnabled: true,
                id: user.id,
                nickname: user.nickname,
            });
        }

        const access_token = await this.authService.generateAccessToken(user);
        const refresh_token = await this.authService.generateRefreshToken(user);

        // hashing refresh token
        const hashedRefreshToken = await this.authService.getHashedRefreshToken(refresh_token);
        // store hashed refresh token
		this.userService.updateUserById(user.id, {
			refreshToken : hashedRefreshToken
		});

        res.setHeader('Authorization', 'Bearer '+ [access_token, refresh_token]);
        res.cookie('access_token', access_token, {
            httpOnly: true,
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
        });

        return res.send({
            message: 'new jwt generated',
            is2faEnabled: false,
            id: user.id,
            nickname: user.nickname,
            access_token: access_token,
            access_token_exp: process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    async refresh(@Req() req: any, @Res() res: Response) {
		console.log("refresh token requested");
        const user = req.user;
        const access_token = await this.authService.generateAccessToken(user);
        res.setHeader('Authorization', 'Bearer '+ access_token);
        res.cookie('access_token', access_token, {
            httpOnly: true,
        });
        return res.send({
            message: 'generate new access token',
            access_token: access_token,
            access_token_exp: process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    async logout(@Req() req: any, @Res() res: Response): Promise<any> {
		await this.userService.updateUserById(req.user.id, {
				refreshToken : null,
		})
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.send({
            message: 'logout success'
        });
    }

    //todo - JwtGuard 실패 시 /auth/login 페이지로 리다이렉트 (UseFilter??)
    // 위 처럼 처리하는 것이 바람직하지 않을 수 있음
    @UseGuards(JwtGuard)
    @Get('test')
    getTest(@Req() req) {

        return req.user; // req.user of JwtGuard
    }
}
