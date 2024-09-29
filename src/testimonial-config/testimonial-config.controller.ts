import { Controller, Post, Body } from '@nestjs/common';
import { TestimonialConfigService } from './testimonial-config.service';
import { CreateTestimonialConfigDto } from './dto/create-testimonial-config.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('testimonial-config')
@Controller('testimonial-config')
export class TestimonialConfigController {
  constructor(
    private readonly testimonialConfigService: TestimonialConfigService,
  ) {}

  @Post()
  create(@Body() createTestimonialConfigDto: CreateTestimonialConfigDto) {
    return this.testimonialConfigService.create(createTestimonialConfigDto);
  }
}
