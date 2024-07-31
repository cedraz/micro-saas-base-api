import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsDate } from 'class-validator';
import { CreateProviderDto } from 'src/auth/dto/create-provider.dto';

export class UpdateUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  PartialType(CreateProviderDto),
) {
  @IsDate()
  email_verified_at?: Date;
}
