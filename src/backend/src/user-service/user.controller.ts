import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
// import { UpdateFriendDto } from 'src/dto/update-friend.dto'; why can't import this?

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/')
	getAllUser() : Promise<object[]> {
		return (this.userService.getAllUser());
	}

	@Get(':id')
	getOneUser(@Param('id', ParseIntPipe) id : number) : Promise<object> {
		return (this.userService.getUserById(id));
	}

	//TODO : id는 절대 바꿀 수 없도록
	//TODO : error code & error msg customize
	//TODO : catch HttpException
	@Patch(':id')
	async updateUser(
		@Param('id', ParseIntPipe) id : number, 
		@Body() data : Prisma.UserUpdateInput) : Promise<Object> {
		return this.userService.updateUserById(id, data);
	}

	//return await~ / return 차이?
	@Get(':id/friend')
	async getUserFriends(@Param('id', ParseIntPipe) id : number) : Promise<object> {
		return this.userService.getUserFriendsById(id);
	}

	//dto 검증 필요
	//body data : isAdd, object/target
	//TODO 여전히 httpException 처리가 안 됨
	@Patch(':id/friend')
	updateUserFriends(
		@Param('id', ParseIntPipe) id : number,
		@Body() data : {
			friend: number ;
			isAdd : boolean ;
		}
		) : Promise<object> {
			try {
				return this.userService.updateFriendsById(id, data);
			} catch (error) {
				if (error instanceof HttpException)
					throw new HttpException("Not in the list", HttpStatus.BAD_REQUEST);
					// throw error;
			}
	}

	@Get(':id/matchhistory')
		async getUserMatchHistory(@Param('id', ParseIntPipe) id : number)
		 : Promise<object[]> {
			return this.userService.getUserMatchHistoryById(id);
	}
}
