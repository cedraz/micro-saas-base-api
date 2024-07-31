import { IsDate, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  provider_id: string;

  @IsString()
  provider_account_id: string;

  @IsString()
  access_token?: string;

  @IsString()
  refresh_token?: string;

  @IsDate()
  access_token_expires?: Date;
}
