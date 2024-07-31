import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [MailerService],
  imports: [
    NestMailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_APP_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MailerService],
})
export class MailerModule {}
