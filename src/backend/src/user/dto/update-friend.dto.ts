import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFriendDto {
  @IsNotEmpty()
  @IsNumber()
  id : number;

  @IsNotEmpty()
  @IsNumber()
  friend: number;
  
  @IsNotEmpty()
  @IsBoolean()
  isAdd: boolean;
}