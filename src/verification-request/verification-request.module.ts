import { Module } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [VerificationRequestService, PrismaService],
  exports: [VerificationRequestService],
})
export class VerificationRequestModule {}
