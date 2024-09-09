import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { VerificationRequestModule } from './verification-request/verification-request.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    AuthModule,
    VerificationRequestModule,
    JwtModule.register({
      global: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost', // name of the service in the docker compose file
        port: 6379,
      },
    }),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
