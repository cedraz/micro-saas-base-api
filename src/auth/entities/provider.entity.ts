import { IsUUID, IsString, IsDate, IsNotEmpty } from 'class-validator';

export class Provider {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  provider_id: string;

  @IsString()
  @IsNotEmpty()
  provider_account_id: string;

  @IsString()
  refresh_token?: string;

  @IsString()
  access_token?: string;

  @IsDate()
  access_token_expires?: Date;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @IsString()
  admin_id: string;
}
