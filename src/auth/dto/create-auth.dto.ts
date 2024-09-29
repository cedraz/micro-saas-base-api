import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { CreateProviderDto } from './create-provider.dto';

export class CreateAuthDto extends CreateProviderDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  image?: string;

  @IsString()
  name?: string;
}
