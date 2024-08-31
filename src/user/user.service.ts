import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import * as bycript from 'bcrypt';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { VerificationType } from '@prisma/client';
import { User } from './entities/user.entity';
import { SendEmailQueueService } from 'src/jobs/send-email-queue/send-email-queue.service';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private verificationRequestService: VerificationRequestService,
    private sendEmailQueueService: SendEmailQueueService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);

    if (userExists) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const salt = await bycript.genSalt(10);
    const password_hash = await bycript.hash(createUserDto.password, salt);

    const user = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        nickname: createUserDto.nickname,
        name: createUserDto.name,
        phone: createUserDto.phone,
        image: createUserDto.image,
        password_hash: password_hash,
      },
    });

    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await this.verificationRequestService.createVerificationRequest({
      identifier: user.email,
      token: token,
      type: VerificationType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await this.sendEmailQueueService.execute({
      to: user.email,
      subject: `Your email verification code is ${token}`,
      message: `Copy and paste this code to verify your email: ${token}`,
    });

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        providers: true,
      },
    });

    return user;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  // updateProviders(userId: string, createProviderDto: CreateProviderDto) {
  //   return this.prismaService.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       providers: {
  //         create: createProviderDto,
  //       },
  //     },
  //   });
  // }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        providers: {
          create: {
            provider_id: updateUserDto.provider_id,
            provider_account_id: updateUserDto.provider_account_id,
            access_token: updateUserDto.access_token,
            refresh_token: updateUserDto.refresh_token,
            access_token_expires: updateUserDto.access_token_expires,
          },
        },
        image: updateUserDto.image,
        phone: updateUserDto.phone,
        name: updateUserDto.name,
        email_verified_at: updateUserDto.email_verified_at,
        nickname: updateUserDto.nickname,
      },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
