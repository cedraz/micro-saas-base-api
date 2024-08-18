import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createEmailTemplate } from './utils/email-template';

export type EmailData = {
  to: string;
  message: string;
  subject: string;
};

@Injectable()
export class MailerService {
  constructor(
    private mailerService: NestMailerService,
    private configService: ConfigService,
  ) {}

  async sendEmail({ to, subject, message }: EmailData) {
    const emailTemplate = createEmailTemplate({ message });

    await this.mailerService.sendMail({
      to: `<${to}>`,
      from: `noreply <${this.configService.get('MAIL_USER')}>`,
      subject,
      html: emailTemplate.html,
    });
  }
}
