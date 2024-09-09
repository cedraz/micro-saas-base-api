import { Module } from '@nestjs/common';
import { SendEmailConsumerService } from './consumers/send-email-consumer.service';
import { SendEmailQueueService } from './queues/send-email-queue.service';
import { MailerService } from 'src/mailer/mailer.service';
import { BullModule } from '@nestjs/bullmq';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { IngestEventQueueService } from './queues/ingest-event-queue.service';
import { IngestEventConsumerService } from './consumers/ingest-event-consumer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClearVerificationRequestsQueueService } from './queues/clear-verification-dto-queue.service';
import { QueueNames } from './utils/queue-names.helper';
import { ClearVerificationRequestsConsumerService } from './consumers/clear-verification-codes-consumer.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QueueNames.SEND_EMAIL_QUEUE,
      },
      {
        name: QueueNames.INGEST_EVENT_QUEUE,
      },
      {
        name: QueueNames.CLEAR_VERIFICATION_REQUESTS_QUEUE,
      },
    ),
  ],
  providers: [
    SendEmailConsumerService,
    SendEmailQueueService,
    IngestEventQueueService,
    IngestEventConsumerService,
    MailerService,
    GoogleSheetsService,
    PrismaService,
    ClearVerificationRequestsQueueService,
    ClearVerificationRequestsConsumerService,
  ],
  exports: [SendEmailQueueService, IngestEventQueueService],
})
export class JobsModule {}
