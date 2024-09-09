import { IsDate, IsEmail, IsString, IsUUID } from 'class-validator';

export class Admin {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}
