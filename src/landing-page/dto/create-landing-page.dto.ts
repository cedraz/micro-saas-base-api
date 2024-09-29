import { IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateLandingPageDto {
  @IsString()
  name: string;

  @IsUrl()
  link: string;

  @IsUUID()
  admin_id: string;

  @IsUUID()
  testimonial_config_id: string;
}
