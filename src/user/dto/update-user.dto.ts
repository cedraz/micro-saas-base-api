import { IntersectionType, PartialType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { CreateProviderDto } from 'src/auth/dto/create-provider.dto';

export class UpdateUserDto extends IntersectionType(
  PartialType(CreateProviderDto),
) {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @IsOptional()
  email_verified_at?: Date;

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
