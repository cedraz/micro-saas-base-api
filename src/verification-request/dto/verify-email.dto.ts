import { IsString, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  identifier: string;

  @IsString()
  token: string;
}
