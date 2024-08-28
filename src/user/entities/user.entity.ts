import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { Provider } from 'src/auth/entities/provider.entity';

export class User {
  @IsUUID()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  password_hash?: string;

  @IsString()
  image?: string;

  @IsString()
  phone?: string;

  @IsString()
  name: string;

  @IsDate()
  email_verified?: Date;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @IsArray()
  providers: Provider[];
}
