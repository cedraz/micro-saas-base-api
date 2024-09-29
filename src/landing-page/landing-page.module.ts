import { Module } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { LandingPageController } from './landing-page.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  controllers: [LandingPageController],
  providers: [
    LandingPageService,
    PrismaService,
    StripeService,
    TestimonialConfigService,
  ],
  exports: [LandingPageService],
  imports: [StripeModule, AdminModule],
})
export class LandingPageModule {}
