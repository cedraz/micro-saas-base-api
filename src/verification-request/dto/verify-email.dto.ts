import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  identifier: string;

  @ApiProperty()
  @IsString()
  token: string;
}
