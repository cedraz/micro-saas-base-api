import { ApiProperty } from '@nestjs/swagger';
import { VerificationType } from '@prisma/client';
import { IsString, IsEmail, IsEnum } from 'class-validator';

export class ValidateVerificationRequestDto {
  @ApiProperty()
  @IsEmail()
  identifier: string;

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsEnum(VerificationType)
  type: VerificationType;
}
