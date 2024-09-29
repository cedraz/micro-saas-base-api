import { IsUUID } from 'class-validator';

export class CreateTestimonialDto {
  @IsUUID()
  landing_page_id: string;

  @IsUUID()
  admin_id: string;
}
