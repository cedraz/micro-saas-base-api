import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateStripeCustomerDto {
  @IsUUID()
  user_id?: string;

  @IsEmail()
  email: string;

  @IsString()
  name?: string;
}
