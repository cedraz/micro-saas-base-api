import { IsString } from 'class-validator';

export class FindAdminByStripeInfoDto {
  @IsString()
  stripe_customer_id: string;

  @IsString()
  stripe_subscription_id: string;
}
