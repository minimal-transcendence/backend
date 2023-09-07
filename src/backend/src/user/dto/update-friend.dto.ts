import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFriendDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  friend: number;
  
  @IsNotEmpty()
  @IsBoolean()
  isAdd: boolean;
}