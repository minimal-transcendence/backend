import { IsNotEmpty } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @IsNotEmpty()
  twoFactorAuthCode: string;
}