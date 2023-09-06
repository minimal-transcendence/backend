import { Body, Controller, Get, UseGuards, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseInterceptors, UploadedFile, ParseFilePipeBuilder, Res, StreamableFile } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { UpdateFriendDto } from './dto/update-friend.dto';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(JwtGuard)
	@Get('/')
	getAllUser() : Promise<object[]> {
		return (this.userService.getAllUser());
	}

	@UseGuards(JwtGuard)
	@Get(':id')
	getOneUser(@Param('id', ParseIntPipe) id : number) : Promise<object> {
		return (this.userService.getUserById(id));
	}

	//TODO : error code & error msg customize
	//TODO : catch HttpException
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor(
		'avatar',
		{
			dest: '/photo',	//없는 폴더면 자동 생성
		})
	)
	@Post(':id')
	async updateUserAvatar(
		@Req() req : any,
		@Param('id', ParseIntPipe) id : number,
		@UploadedFile(
			new ParseFilePipeBuilder()
			.addFileTypeValidator({
				fileType: '.(jpeg|jpg|png|gif)',
			})
			.build({
				fileIsRequired: true
			})
		) file : Express.Multer.File,
		@Body() data : Prisma.UserUpdateInput,
		) : Promise<any>{
		if (req.user.id != id)
			throw new HttpException("Unauthorized action", HttpStatus.BAD_REQUEST);
		
		return this.userService.updateUserById(id, data, file);
	}

	@UseGuards(JwtGuard)
	@Patch(':id')
	async updateUser(
		@Param('id', ParseIntPipe) id : number,
		@Body() data : Prisma.UserUpdateInput) : Promise<Object> {
		return this.userService.updateUserById(id, data);
	}

	@UseGuards(JwtGuard)
	@Get(':id/friend')
	async getUserFriends(@Param('id', ParseIntPipe) id : number) : Promise<object> {
		return this.userService.getUserFriendsById(id);
	}

	//dto 검증 필요
	@UseGuards(JwtGuard)
	@Patch(':id/friend')
	updateUserFriends(
		@Req() req : any,
		@Param('id', ParseIntPipe) id : number,
		@Body() data : UpdateFriendDto
		) : Promise<object> {
			if (req.user.id != id)
				throw new HttpException("Unauthorized action", HttpStatus.BAD_REQUEST);
			return this.userService.updateFriendsById(id, data);
	}


	@UseGuards(JwtGuard)
	@Get(':id/matchhistory')
	async getUserMatchHistory(@Param('id', ParseIntPipe) id : number)
		 : Promise<object[]> {
			return this.userService.getUserMatchHistoryById(id);
	}

	// seunchoi: no guard here
	@Get(':id/photo')
	async streamUserImage(@Param('id', ParseIntPipe) id : number) {
		return await this.userService.getUserImageById(id)
			.catch((error) => {
				throw new HttpException(error.message, HttpStatus.NOT_FOUND);
			})
	}
}

//TODO : 얘는 가드를 하는 건 좀 이상한 것 같은데..
@UseGuards(JwtGuard)
@Controller('photo/:img')
export class avatarController {
	constructor(private readonly userService: UserService) {}

	@Get()
	getAvatar(@Param('img') img : string) : StreamableFile {
		const file = createReadStream(join('/photo/' + img));
		return new StreamableFile(file);
	}
}