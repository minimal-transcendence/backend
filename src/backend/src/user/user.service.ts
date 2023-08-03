import { Injectable, HttpException, HttpStatus, StreamableFile } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { join } from 'path';
import { createReadStream } from 'fs';
// import { isDataView } from 'util/types'; ?

/*
	TODO : ERROR CASE - CUSTOM ERROR MSG
	*** CHECK AUTHORITY ***
	*/
@Injectable()
export class UserService {
	constructor(private prisma: PrismaService){}
	/*
		[ TODO ] 
	1. id, nickname, score 등 화면에 뿌릴 column 목록 정하기
	2. 최근 접속 순 (updatedAt) 정렬? or score순? or 복합
	3. pagenation 필요? (유저 목록 표시 방법 : scroll, board-style, etc.)
	*/
	async getAllUser() : Promise<object[]>{
		const res = await this.prisma.user.findMany({
			select: {
				id: true,
				nickname : true,
				avatar : true,
				score : true,
				lastLogin : true
			},
			orderBy: { lastLogin : 'desc' }
		});
		return (res);
	}

	//findUnique or Throw
	async getUserById(id : number) : Promise<object>{
		return await this.prisma.user.findUniqueOrThrow({
			where: { id : id },
			select: {
				id : true,
				nickname : true,
				email : true,
				avatar : true,
				score : true,
				lastLogin : true,
				_count: {
					select : {
						asWinner : true,
						asLoser : true,
					}
				}
			}}).then((res) => {
				return (res);
			})
			.catch((error) => {
				return { message: 'An error occurred', error: error.message};
			});
	}

	async updateUserByIdWithAvatar(
		id: number, 
		data : Prisma.UserUpdateInput, 
		file : Express.Multer.File)
	{
		return await this.prisma.user.update({
			where : { id : id },
			data : {
				...data,
				id : id,
				avatar : file.path.toString()
				// avatar : file.filename.toString()
			}
		}).catch((error) => {
			if (error instanceof Prisma.PrismaClientValidationError){
				return { error : "Validation Error" };
			}
			else
				return { code : error.code, error : error.message };
		});
	}

	/* 다른 모듈에서 재사용 가능 : 체크해보기 */
	//avatar file upload : patch 에서는 오류가 난다는 이야기도 있고 post 에서 실행되도록 설계했다는 이야기도 있음 체크 필요
	async updateUserById(
		id : number,
		data : Prisma.UserUpdateInput
		) : Promise<object> {
		//
		return await this.prisma.user.update({
			where : { id : id },
			data : {
				...data,
				id : id,
			}
		}).catch((error) => {
			if (error instanceof Prisma.PrismaClientValidationError){
				return { error : "Validation Error" };
			}
			else
				return { code : error.code, error : error.message };
		});
	}

	// async deleteUserById(id : number){
	// 	// should remove user & all related matchhistory
	// 	// return await this.prisma.user.delete({
	// 	// 	where : { id }
	// 	// })
	// }

	//만약 Id list 뿐만 아니라 친구들의 정보값이 필요하면 friend[] 로 설정해야
	async getUserFriendsListById(id : number) : Promise<object> {
		return await this.prisma.user.findUniqueOrThrow({
			where : { id : id }
		})
		.then((res) => { return res.friends })
		.catch((error) => {
			return { message: '', error: error.message };
		})
	}

	//고유한 field값이 필요한지 확인 //Promise chaining 쓰고 싶음
	/*
	async getUserFriendsById(id : number) : Promise<object> {
		const user =  await this.prisma.user.findUniqueOrThrow({
			where : { id : id }
		})

		return await Promise.all(
			user.friends.map(async (element) : Promise<object> => {
				return await this.getUserById(element);
			})
		)
		.then ((res) => {
			return (res);	//왜 여기서 return 하지 않는지...?
		})
		.catch((error) => {
			return { message: '', error: error.message };
		})
	}
	*/
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
	
	// async getUserFriendsById(id: number): Promise<object> {
	// 	try {
	// 	  const user = await this.prisma.user.findUniqueOrThrow({
	// 		where: { id: id },
	// 	  });

	// 	  const friendList = await Promise.all(
	// 		user.friends.map(async (element) => {
	// 		  return await this.getUserById(element);
	// 		})
	// 	  );
	  
	// 	  return { friendList };
	// 	} catch (error) {
	// 	  return { message: '', error: error.message };
	// 	}
	//   }

	// 이런 문법 괜찮은가...?
	// 이이런 구조 괜찮은가....?
	// 권한 체크! -> 완료
	// HTTP EXCEPTION -> 완료
	// validation 필요//
	async updateFriendsById(id : number, data : {
		friend: number ;
		isAdd : boolean ;
	}) : Promise<object>{
		if (id == data.friend)
			throw new HttpException(
				"I am a good friend of myself...",
				HttpStatus.BAD_REQUEST
			);
		const user = await this.prisma.user.findUniqueOrThrow({
			where : { id },
			select : { friends : true }
		});
		if (data.isAdd == true) {
			if (user.friends.includes(data.friend))
				throw new HttpException(
					"Already In!",
					HttpStatus.BAD_REQUEST
				);
			return this.prisma.user.update({
			where : { id },
			data : {
				friends : {
					push : data.friend,
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
			where : { id },
			data : {
				friends : {
					set : user.friends.filter((num) => num !== data.friend ),
				}
			}
		});
		}
	}

	//반환값을 Promise<object[] | null> 로 하든 아니든 결과는 같다
	//CreatedTime 출력법 어떻게?
	async getUserMatchHistoryById(id : number) : Promise<object[]>{
		return this.prisma.matchHistory.findMany({
			where : {
				OR: [ {winnerId: id}, {loserId: id}]
			},
			select : {
				winner : {
					select : { nickname : true }
				},
				loser : {
					select : { nickname : true }
				},
				createdTime : true	//1분 전 30분 전 이런거 할말...?
			},
			orderBy : { createdTime : 'desc' }
		})
	}

	async getUserImageById(id : number) {
		const fileName = await this.prisma.user.findUnique({
			where : { id },
			select : { avatar : true },
		}).then((res) => {return res.avatar});
		if (!fileName)
			return null;
		console.log('/app/photo/' + fileName);
		const file = createReadStream(join('/app/photo/' + fileName));
		return new StreamableFile(file);
	}
}

