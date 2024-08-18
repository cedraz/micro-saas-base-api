import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EmailData } from 'src/mailer/mailer.service';

@Injectable()
export class SendEmailQueueService {
  constructor(
    @InjectQueue('SEND_EMAIL_QUEUE')
    private sendEmailQueue: Queue,
  ) {}

  async execute({ to, message, subject }: EmailData) {
    await this.sendEmailQueue.add('SEND_EMAIL_QUEUE', {
      to,
      message,
      subject,
    });
  }
}
