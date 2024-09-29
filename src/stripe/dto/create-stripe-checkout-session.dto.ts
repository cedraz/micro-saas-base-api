import { IsString } from 'class-validator';

export class CreateStripeSCheckoutSessionDto {
  @IsString()
  stripe_customer_id: string;

  @IsString()
  stripe_subscription_id: string;
}
