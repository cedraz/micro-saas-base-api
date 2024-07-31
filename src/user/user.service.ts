import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import bycript from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { VerificationType } from '@prisma/client';
import { MailerService } from 'src/mailer/mailer.service';
import { User } from './entities/user.entity';
import { CreateProviderDto } from 'src/auth/dto/create-provider.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private verificationRequestService: VerificationRequestService,
    private mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = this.findByEmail(createUserDto.email);

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

    const token = uuidv4();

    await this.verificationRequestService.createVerificationRequest({
      identifier: user.email,
      token: token,
      type: VerificationType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    this.mailerService.sendEmail({
      to: user.email,
      subject: `Your email verification code is ${token}`,
      message: `Copy and paste this code to verify your email: ${token}`,
    });

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        providers: true,
      },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  updateProviders(userId: string, createProviderDto: CreateProviderDto) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        providers: {
          create: createProviderDto,
        },
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${updateUserDto.email} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
