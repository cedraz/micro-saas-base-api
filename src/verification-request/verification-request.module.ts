import { Module } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationRequestController } from './verification-request.controller';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  providers: [VerificationRequestService, PrismaService],
  exports: [VerificationRequestService],
  controllers: [VerificationRequestController],
  imports: [JobsModule],
})
export class VerificationRequestModule {}
