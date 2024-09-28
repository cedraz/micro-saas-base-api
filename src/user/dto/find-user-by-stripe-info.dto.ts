import { IsString } from 'class-validator';

export class FindUserByStripeInfoDto {
  @IsString()
  stripe_customer_id: string;

  @IsString()
  stripe_subscription_id: string;
}
