import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guards/google.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleOAuthGuard,
    UserService,
    PrismaService,
    JwtStrategy,
  ],
  imports: [
    PassportModule,
    VerificationRequestModule,
    MailerModule,
    UserModule,
    JobsModule,
  ],
})
export class AuthModule {}
