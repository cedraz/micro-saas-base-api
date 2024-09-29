import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, VerificationRequestService],
  exports: [AdminService],
  imports: [
    forwardRef(() => StripeModule),
    JobsModule,
    forwardRef(() => VerificationRequestModule),
  ],
})
export class AdminModule {}
