import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { CreateProviderDto } from './create-provider.dto';

export class CreateAuthDto extends CreateProviderDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  image?: string;

  @IsString()
  phone?: string;

  @IsString()
  name?: string;
}
