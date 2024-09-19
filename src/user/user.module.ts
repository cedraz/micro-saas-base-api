import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, VerificationRequestService, PrismaService],
  exports: [UserService],
  imports: [VerificationRequestModule, JobsModule],
})
export class UserModule {}
