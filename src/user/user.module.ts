import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    MailerService,
    VerificationRequestService,
  ],
  exports: [UserService],
  imports: [VerificationRequestModule, JobsModule],
})
export class UserModule {}
