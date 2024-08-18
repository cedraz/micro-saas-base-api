import { Module } from '@nestjs/common';
import { SendEmailConsumerService } from './send-email-consumer/send-email-consumer.service';
import { SendEmailQueueService } from './send-email-queue/send-email-queue.service';
import { MailerService } from 'src/mailer/mailer.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SEND_EMAIL_QUEUE',
    }),
  ],
  providers: [SendEmailConsumerService, SendEmailQueueService, MailerService],
  exports: [SendEmailQueueService],
})
export class JobsModule {}
