import { IsDate, IsEmail, IsString, IsUUID } from 'class-validator';

export class IngestEventDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDate()
  date: Date;

  @IsString()
  event_type: string;
}
