import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guards/google.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JobsModule } from 'src/jobs/jobs.module';
import { AdminService } from 'src/admin/admin.service';
import { AdminModule } from 'src/admin/admin.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleOAuthGuard,
    AdminService,
    PrismaService,
    JwtStrategy,
  ],
  imports: [
    PassportModule,
    VerificationRequestModule,
    MailerModule,
    forwardRef(() => StripeModule),
    forwardRef(() => AdminModule),
    AdminModule,
    JobsModule,
  ],
})
export class AuthModule {}
