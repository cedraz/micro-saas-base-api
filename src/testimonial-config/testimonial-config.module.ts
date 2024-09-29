import { Module } from '@nestjs/common';
import { TestimonialConfigService } from './testimonial-config.service';
import { TestimonialConfigController } from './testimonial-config.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TestimonialConfigController],
  providers: [TestimonialConfigService, PrismaService],
  exports: [TestimonialConfigService],
  imports: [StripeModule],
})
export class TestimonialConfigModule {}
