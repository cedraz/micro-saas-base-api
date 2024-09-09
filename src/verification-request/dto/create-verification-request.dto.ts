import { VerificationType } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsEmail()
  identifier: string;

  @IsEnum(VerificationType)
  type: VerificationType;
}
