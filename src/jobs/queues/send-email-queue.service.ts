import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EmailData } from 'src/mailer/mailer.service';
import { QueueNames } from '../utils/queue-names.helper';

@Injectable()
export class SendEmailQueueService {
  constructor(
    @InjectQueue(QueueNames.SEND_EMAIL_QUEUE)
    private sendEmailQueue: Queue,
  ) {}

  async execute({ to, message, subject }: EmailData) {
    await this.sendEmailQueue.add(QueueNames.SEND_EMAIL_QUEUE, {
      to,
      message,
      subject,
    });
  }
}
