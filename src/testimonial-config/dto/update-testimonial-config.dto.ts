import { PartialType } from '@nestjs/swagger';
import { CreateTestimonialConfigDto } from './create-testimonial-config.dto';

export class UpdateTestimonialConfigDto extends PartialType(CreateTestimonialConfigDto) {}
