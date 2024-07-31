import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsDate } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsDate()
  email_verified_at?: Date;
}
