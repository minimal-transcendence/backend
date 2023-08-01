import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { TwoFactorAuthCodeDto } from 'src/dto/2fa-code.dto';
import { User } from '@prisma/client';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Controller('2fa')
export class TwoFactorAuthController {
    constructor(
        private authService: AuthService,
        private twoFactorAuthService: TwoFactorAuthService,
        private UserAuthService: UserAuthService
    ) {}

    @Post('authenticate')
    async authenticate(
        @Req() req: Request,
        @Res() res: Response,
        @Body() twoFactorAuthCode: TwoFactorAuthCodeDto
    ) {
        const user = await this.UserAuthService.findUserById(twoFactorAuthCode.id);
        if (!user) {
            throw new UnauthorizedException('No user in database');
        }

        const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthCodeValid(
            twoFactorAuthCode.twoFactorAuthCode, user
        )

        if (!isCodeValidated) {
            throw new UnauthorizedException('Invalid otp code');
        }

        const access_token = await this.authService.generateAccessToken(user);
        const refresh_token = await this.authService.generateRefreshToken(user);

        // hashing refresh token
        const hashedRefreshToken = await this.authService.getHashedRefreshToken(refresh_token);
        // store hashed refresh token
        this.UserAuthService.setRefreshToken(user.id, hashedRefreshToken);

        res.setHeader('Authorization', 'Bearer '+ [access_token, refresh_token]);
        res.clearCookie('id');
        res.cookie('access_token', access_token, {
            httpOnly: true,
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
        });

        return res.send({
            message: 'new jwt generated',
            access_token: access_token,
            access_token_exp: process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    @UseGuards(JwtGuard)
    @Get('qrcode')
    async getQrCode(@Req() req: any, @Res() res: Response) {
        const user = req.user;
        return await this.twoFactorAuthService.generateQrCode(res, user);
    }

    @UseGuards(JwtGuard)
    @Get('test-turn-on')
    async testOn(
        @Req() req: any
    ) {
        const user = req.user;
        this.UserAuthService.setTwoFactorAuth(user.id, true);
        return { message: '2fa turn on' }
    }

    @UseGuards(JwtGuard)
    @Post('turn-on')
    async twoFactorAuthOn(
        @Req() req: any,
        @Body() twoFactorAuthCode: TwoFactorAuthCodeDto
    ) {
        const user: User = req.user;

        const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthCodeValid(
            twoFactorAuthCode.twoFactorAuthCode, user
        )

        if (!isCodeValidated) {
            throw new UnauthorizedException('Invalid otp code');
        }

        this.UserAuthService.setTwoFactorAuth(user.id, true);
        return { message: '2fa turn on' }
    }

    @UseGuards(JwtGuard)
    @Post('turn-off')
    async twoFactorAuthOff(
        @Req() req: any,
        @Body() twoFactorAuthCode: TwoFactorAuthCodeDto
    ) {
        const user: User = req.user;

        const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthCodeValid(
            twoFactorAuthCode.twoFactorAuthCode, user
        )

        if (!isCodeValidated) {
            throw new UnauthorizedException('Invalid otp code');
        }

        this.UserAuthService.setTwoFactorAuth(user.id, false);
        return { message: '2fa turn off' }
    }
}
