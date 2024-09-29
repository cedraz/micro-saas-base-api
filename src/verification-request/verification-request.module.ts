import { forwardRef, Module } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationRequestController } from './verification-request.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  providers: [VerificationRequestService, PrismaService],
  exports: [VerificationRequestService],
  controllers: [VerificationRequestController],
  imports: [JobsModule, forwardRef(() => StripeModule)],
})
export class VerificationRequestModule {}
