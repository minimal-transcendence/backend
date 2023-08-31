import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';

//why not type then class?
export class MessageDto {
    @IsNotEmpty()
	@IsString()
	to : string;
	
    @IsNotEmpty()
	@IsString()
	body : string;
}

export class RoomDto {
	@IsNotEmpty()
	@IsString()
	roomname : string;

	@IsString()
	password : string;
}

export class TargetDto {
	@IsNotEmpty()
	@IsString()
	target : string;
}

export class UserInfoDto {
	@IsNotEmpty()
	@IsNumber()	//or IsNumberString?
	userId : number;

	@IsNumber()
	targetId : number;
}

// export type RoomEventDto = RoomDto & TargetDto;
export class RoomEventDto extends IntersectionType (
	RoomDto,
	TargetDto
) {}