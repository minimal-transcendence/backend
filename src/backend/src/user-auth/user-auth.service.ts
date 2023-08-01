import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserAuthService {
    constructor (
        private prisma: PrismaService,
    ){}

    async findUserById(userId: number): Promise<any | undefined> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        return user
    }

    async addNewUser(data: any): Promise<User> {
        const target = await this.findUserById(data.id);
        if (target) {
            return target;
        }
        const user = await this.prisma.user.create({
            data: {
                id: data.id,
                email: data.email,
            }
        })
        return user;
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User>
    {
        const user = await this.findUserById(userId);

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

    async setRefreshToken(userId: number, refreshToken: string): Promise<void> {

        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refreshToken: refreshToken,
            },
        })
    }

    async removeRefreshToken(userId: number): Promise<any> {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refreshToken: null,
            },
        })

        return true;
    }

    async setTwoFactorAuthSecret(userId: number, secret: string): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                otpSecret: secret,
            },
        })
    }

    async setTwoFactorAuth(userId: number, bool: boolean): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                is2faEnabled: bool,
            },
        })
    }
}
