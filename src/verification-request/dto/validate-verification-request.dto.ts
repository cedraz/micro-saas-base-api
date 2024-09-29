import { VerificationType } from '@prisma/client';
import { IsString, IsEmail, IsEnum } from 'class-validator';

export class ValidateVerificationRequestDto {
  @IsEmail()
  identifier: string;

  @IsString()
  token: string;

  @IsEnum(VerificationType)
  type: VerificationType;
}
