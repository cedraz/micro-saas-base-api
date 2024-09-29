import { Module } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { LandingPageService } from 'src/landing-page/landing-page.service';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';

@Module({
  controllers: [TestimonialController],
  providers: [
    TestimonialService,
    PrismaService,
    LandingPageService,
    TestimonialConfigService,
  ],
  imports: [StripeModule],
})
export class TestimonialModule {}
