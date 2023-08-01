import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
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

	//upsert
    async addNewUser(data: Prisma.UserCreateInput): Promise<User> {
		if (!data.nickname){
			data.nickname = `user_${Math.floor(Math.random() * 1000)}`;
		}
		return await this.prisma.user.upsert({
			where : {
				id : data.id,
			},
			update : {},
			create: {
				id : data.id,
				nickname: data.nickname,
				email : data.email
			}
		})
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null>
    {
        const user = await this.findUserById(userId);

        if (!user) {
            return null;
        }

        if (!user.refreshToken) {
            return null;
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

    // async removeRefreshToken(userId: number): Promise<any> {
    //     await this.prisma.user.update({
    //         where: {
    //             id: userId,
    //         },
    //         data: {
    //             refreshToken: null,
    //         },
    //     })

    //     return true;
    // }

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
