import { IsString } from 'class-validator';

export class CreateStripeSCheckoutSessionDto {
  @IsString()
  stripe_customer_id: string;

  @IsString()
  success_url: string;

  @IsString()
  cancel_url: string;
}
