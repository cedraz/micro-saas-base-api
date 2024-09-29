import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { VerificationRequest, VerificationType } from '@prisma/client';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtService } from '@nestjs/jwt';
import { ValidateVerificationRequestDto } from './dto/validate-verification-request.dto';
import { SendEmailQueueService } from 'src/jobs/queues/send-email-queue.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class VerificationRequestService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private sendEmailQueueService: SendEmailQueueService,
    private stripeService: StripeService,
  ) {}

  isVerificationRequestExpired(expires: Date) {
    return new Date() > expires;
  }

  async createVerificationRequest({
    createVerificationRequestDto,
    code,
    expiresIn,
  }: {
    createVerificationRequestDto: CreateVerificationRequestDto;
    code?: string;
    expiresIn?: Date;
  }): Promise<VerificationRequest> {
    const token = code
      ? code
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expires = expiresIn
      ? expiresIn
      : new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

    const verificationRequest =
      await this.prismaService.verificationRequest.upsert({
        where: {
          identifier: createVerificationRequestDto.identifier,
        },
        update: {
          token,
          expires,
          type: createVerificationRequestDto.type,
        },
        create: {
          identifier: createVerificationRequestDto.identifier,
          token,
          type: createVerificationRequestDto.type,
          expires,
        },
      });

    await this.sendEmailQueueService.execute({
      to: createVerificationRequestDto.identifier,
      subject: `Your email verification code is ${token}`,
      message: `Copy and paste this code to verify your email: ${token}`,
    });

    return verificationRequest;
  }

  async createAdminVerificationRequest(email: string) {
    const admin = await this.prismaService.admin.findFirst({
      where: {
        email,
      },
    });

    if (admin) {
      throw new HttpException('Usuário administrador já existe', 403);
    }

    const verificationRequest = await this.createVerificationRequest({
      createVerificationRequestDto: {
        identifier: email,
        type: VerificationType.EMAIL_VERIFICATION,
      },
      expiresIn: new Date(new Date().getTime() + 20 * 60 * 1000), // 20 minutes
    });

    await this.sendEmailQueueService.execute({
      to: email,
      subject: `Your email verification code is ${verificationRequest.token}`,
      message: `Copy and paste this code to verify your email: ${verificationRequest.token}`,
    });

    return verificationRequest;
  }

  async validateVerificationRequest(
    validateVerificationRequestDto: ValidateVerificationRequestDto,
  ) {
    const verificationRequest =
      await this.prismaService.verificationRequest.findFirst({
        where: {
          identifier: validateVerificationRequestDto.identifier,
          token: validateVerificationRequestDto.token,
          type: validateVerificationRequestDto.type,
        },
      });

    if (
      !verificationRequest &&
      !this.isVerificationRequestExpired(verificationRequest.expires)
    ) {
      return false;
    }

    const tokenPayload = {
      sub: validateVerificationRequestDto.identifier,
      type: validateVerificationRequestDto.type,
      expiresIn: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes
    };

    return {
      token: this.jwtService.sign(tokenPayload),
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const verificationRequest =
      await this.prismaService.verificationRequest.findFirst({
        where: {
          identifier: verifyEmailDto.identifier,
          token: verifyEmailDto.token,
          type: VerificationType.EMAIL_VERIFICATION,
        },
      });

    if (
      !verificationRequest &&
      !this.isVerificationRequestExpired(verificationRequest.expires)
    ) {
      return false;
    }

    const admin = await this.prismaService.admin.findFirst({
      where: {
        email: verifyEmailDto.identifier,
      },
    });

    const stripeCustomer = await this.stripeService.createCustomer({
      email: admin.email,
      name: admin.name,
      admin_id: admin.id,
    });

    await this.prismaService.admin.update({
      where: {
        email: verifyEmailDto.identifier,
      },
      data: {
        email_verified_at: new Date(),
        stripe_price_id: stripeCustomer.price_id,
        stripe_customer_id: stripeCustomer.id,
        stripe_subscription_id: stripeCustomer.subscription_id,
        stripe_subscription_status: stripeCustomer.subscription_status,
      },
    });

    await this.prismaService.verificationRequest.delete({
      where: {
        identifier: verifyEmailDto.identifier,
      },
    });

    return true;
  }
}
