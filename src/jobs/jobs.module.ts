import { Module } from '@nestjs/common';
import { SendEmailConsumerService } from './consumers/send-email-consumer.service';
import { SendEmailQueueService } from './queues/send-email-queue.service';
import { MailerService } from 'src/mailer/mailer.service';
import { BullModule } from '@nestjs/bullmq';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { IngestEventQueueService } from './queues/ingest-event-queue.service';
import { IngestEventConsumerService } from './consumers/ingest-event-consumer.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'INGEST_EVENT_QUEUE',
      },
      {
        name: 'SEND_EMAIL_QUEUE',
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
  ],
  exports: [SendEmailQueueService, IngestEventQueueService],
})
export class JobsModule {}
