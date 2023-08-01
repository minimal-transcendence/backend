import { IsNotEmpty } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  twoFactorAuthCode: string;
}