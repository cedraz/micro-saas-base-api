import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  stripe_customer_id?: string;

  @IsString()
  @IsOptional()
  stripe_subscription_id?: string;

  @IsString()
  @IsOptional()
  stripe_price_id?: string;

  @IsString()
  @IsOptional()
  stripe_subscription_status?: string;
}
