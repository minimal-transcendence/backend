import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { networkInterfaces } from 'os';

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
		//while phrase?
		while (!data.nickname){
			data.nickname = `user_${Math.floor(Math.random() * 1000)}`;
			const isUnique = await this.prisma.user.findUnique({	//
				where : { nickname : data.nickname },
				select : { nickname : true }
			});
			if (isUnique)
				data.nickname = null;
		}
		console.log("here");
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
