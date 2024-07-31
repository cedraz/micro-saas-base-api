import { VerificationType } from '@prisma/client';
import { IsDate, IsEmail, IsEnum, IsString, IsUUID } from 'class-validator';

export class VerificationRequest {
  @IsUUID()
  id: string;

  @IsEmail()
  identifier: string;

  @IsString()
  token: string;

  @IsEnum(VerificationType)
  type: VerificationType;

  @IsDate()
  expires: Date;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}
