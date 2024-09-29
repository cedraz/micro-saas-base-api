import { ApiProperty } from '@nestjs/swagger';
import { TestimonialFormat } from '@prisma/client';
import { IsEnum, IsInt, IsUUID } from 'class-validator';

export class CreateTestimonialConfigDto {
  @ApiProperty({
    enum: TestimonialFormat,
  })
  @IsEnum(TestimonialFormat)
  format: TestimonialFormat;

  @IsInt()
  title_char_limit: number;

  @IsInt()
  message_char_limit: number;

  @ApiProperty({
    description: 'The number of days before a testimonial expires',
  })
  @IsInt()
  expiration_limit: number;

  @IsUUID()
  admin_id: string;
}
