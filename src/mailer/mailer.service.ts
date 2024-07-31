import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

export type EmailData = {
  to: string;
  message: string;
  subject: string;
};

@Injectable()
export class MailerService {
  constructor(private mailerService: NestMailerService) {}

  async sendEmail({ to, subject, message }: EmailData) {
    await this.mailerService.sendMail({
      to: `<${to}>`,
      from: 'Film Flow <filmflowdev@gmail.com>',
      subject: subject,
      html: `<h3 style="color: red">${message}</h3>`,
    });
  }
}
