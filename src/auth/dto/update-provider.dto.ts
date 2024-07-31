import { PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateProviderDto } from './create-provider.dto';

export class UpdateAccountDto extends PartialType(CreateProviderDto) {
  @IsString()
  refresh_token?: string;

  @IsString()
  access_token?: string;

  @IsString()
  access_token_expires?: Date;
}
