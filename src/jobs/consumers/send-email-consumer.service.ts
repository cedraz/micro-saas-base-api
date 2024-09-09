import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailData, MailerService } from 'src/mailer/mailer.service';
import { QueueNames } from '../utils/queue-names.helper';

@Processor(QueueNames.SEND_EMAIL_QUEUE)
export class SendEmailConsumerService extends WorkerHost {
  constructor(private mailerService: MailerService) {
    super();
  }

  async process({ data }: Job<EmailData>) {
    const { to, message, subject } = data;

    await this.mailerService.sendVerifyEmailCode({ to, message, subject });
  }
}
