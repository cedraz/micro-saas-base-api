import { VerificationType } from '@prisma/client';
import { IsString, IsEmail, IsEnum, IsDate } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsEmail()
  identifier: string;

  @IsString()
  token: string;

  @IsEnum(VerificationType)
  type: VerificationType;

  @IsDate()
  expires: Date;
}
