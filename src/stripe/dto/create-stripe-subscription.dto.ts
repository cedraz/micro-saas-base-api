import { IsEnum, IsString } from 'class-validator';

export class CreateStripeSubscriptionDto {
  @IsEnum(['free', 'premium'])
  plan: string;

  @IsString()
  stripe_customer_id: string;
}
