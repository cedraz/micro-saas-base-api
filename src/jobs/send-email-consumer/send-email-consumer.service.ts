import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailData, MailerService } from 'src/mailer/mailer.service';

@Processor('SEND_EMAIL_QUEUE')
export class SendEmailConsumerService extends WorkerHost {
  constructor(private mailerService: MailerService) {
    super();
  }

  async process({ data }: Job<EmailData>) {
    const { to, message, subject } = data;

    await this.mailerService.sendEmail({ to, message, subject });
  }
}
