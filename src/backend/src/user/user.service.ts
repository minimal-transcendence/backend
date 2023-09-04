import { Injectable, HttpException, HttpStatus, StreamableFile, ConsoleLogger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from '@prisma/client';
import { join } from 'path';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { ChatGateway } from 'src/socket.io/chat/chat.gateway';
import { GameGateway } from 'src/socket.io/game/game.gateway';

@Injectable()
export class UserService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly chatGateway: ChatGateway,
		private readonly gameGateway: GameGateway
	) { }

	//upsert
	async createUser(data: Prisma.UserCreateInput): Promise<User> {
		while (!data.nickname) {
			data.nickname = `user_${Math.floor(Math.random() * 1000)}`;
			const isUnique = await this.prisma.user.findUnique({
				where: { nickname: data.nickname },
				select: { nickname: true }
			});
			if (isUnique)
				data.nickname = null;
		}
		return await this.prisma.user.upsert({
			where: {
				id: data.id,
			},
			update: {},
			create: {
				id: data.id,
				nickname: data.nickname,
				email: data.email
			}
		})
	}

	async findUserById(userId: number): Promise<any | undefined> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		})

		return user
	}

	/*
		[ TODO ] 
	1. id, nickname, score 등 화면에 뿌릴 column 목록 정하기
	2. 최근 접속 순 (updatedAt) 정렬? or score순? or 복합
	3. pagenation 필요? (유저 목록 표시 방법 : scroll, board-style, etc.)
	*/
	async getAllUser(): Promise<object[]> {
		const res = await this.prisma.user.findMany({
			select: {
				id: true,
				nickname: true,
				avatar: true,
				score: true,
				lastLogin: true
			},
			orderBy: { lastLogin: 'desc' },
			where : { id : { not : 0 }}
		});
		return (res);
	}

	//findUnique or Throw
	async getUserById(id: number): Promise<object> {
		return await this.prisma.user.findUniqueOrThrow({
			where: { id: id },
			select: {
				id: true,
				nickname: true,
				email: true,
				avatar: true,
				score: true,
				lastLogin: true,
				_count: {
					select: {
						asWinner: true,
						asLoser: true,
					}
				}
			}
		}).then((res) => {
			return (res);
		})
			.catch((error) => {
				return { message: 'An error occurred', error: error.message };
			});
	}
	//현재 문법 가능한지 check
	async updateUserById(
		id: number,
		data: Prisma.UserUpdateInput,
		file?: Express.Multer.File) {
		let oldAvatar: string;
		if (file) {
			oldAvatar = await this.prisma.user.findUniqueOrThrow({
				where: { id },
				select: { avatar: true }
			}).then((res) => { return res.avatar })
		}
		return await this.prisma.user.update({
			where: { id: id },
			data: {
				...data,
				id: undefined,
				friends: undefined,
				avatar: file != null ? file.filename.toString() : undefined,
			}
		}).then((res) => {
			if (file) {
				this.chatGateway.updateUserAvatar(id, file.path.toString() as string);
				if (oldAvatar != "default.png") {
					fs.unlink('/photo/' + oldAvatar, (err) => {
						//err처리
						if (err)
							console.log(err);
					});
				}
			}
			if (data.nickname) {
				this.chatGateway.updateUserNick(id, data.nickname as string);
				this.gameGateway.updateUserNick(id, data.nickname as string);
			}
			return (res);
		}).catch((error) => {
			if (error instanceof Prisma.PrismaClientValidationError) {
				return { error: "Validation Error" };
			}
			else
				return { code: error.code, error: error.message };
		});
	}

	//만약 Id list 뿐만 아니라 친구들의 정보값이 필요하면 friend[] 로 설정해야
	async getUserFriendsListById(id: number): Promise<object> {
		return await this.prisma.user.findUniqueOrThrow({
			where: { id: id }
		})
			.then((res) => { return res.friends })
			.catch((error) => {
				return { message: '', error: error.message };
			})
	}

	async getUserFriendsById(id: number): Promise<object> {
		return this.prisma.user.findUniqueOrThrow({
			where: { id: id },
		})
			.then((user) => {
				return Promise.all(
					user.friends.map((element) => {
						return this.getUserById(element);
					})
				);
			})
			.then((friendList) => {
				return { friendList };
			})
			.catch((error) => {
				return { message: '', error: error.message };
			});
	}

	// 이런 문법 괜찮은가...?
	// 이이런 구조 괜찮은가....?
	// 권한 체크! -> 완료
	// HTTP EXCEPTION -> 완료
	// validation 필요//
	async updateFriendsById(id: number, data: {
		friend: number;
		isAdd: boolean;
	}): Promise<object> {
		if (id == data.friend)
			throw new HttpException(
				"I am a good friend of myself...",
				HttpStatus.BAD_REQUEST
			);
		//find user
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id },
			select: { friends: true }
		});

		if (data.isAdd == true) {
			//friend validatity check
			await this.prisma.user.findUniqueOrThrow({
				where: { id: data.friend },
			});
			if (user.friends.includes(data.friend))
				throw new HttpException(
					"Already In!",
					HttpStatus.BAD_REQUEST
				);
			return this.prisma.user.update({
				where: { id },
				data: {
					friends: {
						push: data.friend,
					}
				}
			})
		}
		else {
			if (!user.friends.includes(data.friend))
				throw new HttpException(
					"Not in the list",
					HttpStatus.BAD_REQUEST,
				);
			return await this.prisma.user.update({
				where: { id },
				data: {
					friends: {
						set: user.friends.filter((num) => num !== data.friend),
					}
				}
			});
		}
	}

	//CreatedTime 출력법 어떻게?
	//TODO : 여기 useful information 필요하다고 되어있음... score 필요할까?
	async getUserMatchHistoryById(id: number): Promise<object[]> {
		return await this.prisma.matchHistory.findMany({
			where: {
				OR: [{ winnerId: id }, { loserId: id }]
			},
			select: {
				winner: {
					select: {
						nickname: true,
						avatar: true
					}
				},
				loser: {
					select: {
						nickname: true,
						avatar: true
					}
				},
				createdTime: true
			},
			orderBy: { createdTime: 'desc' }
		})
	}

	async getUserImageById(id: number) {
		const fileName = await this.prisma.user.findUnique({
			where: { id },
			select: { avatar: true },
		}).then((res) => {
			return res.avatar
		});
		if (!fileName)
			return null;
		const file = createReadStream(join('/photo/' + fileName));
		return new StreamableFile(file);
	}
}