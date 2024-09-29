import { IsInt, IsString } from 'class-validator';

export class CompleteTestimonialDto {
  @IsString()
  customer_name: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsInt()
  stars: number;
}
