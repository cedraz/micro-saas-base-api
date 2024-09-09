import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import * as bcrypt from 'bcrypt';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { Prisma, VerificationType } from '@prisma/client';
import { User } from './entities/user.entity';
import { UserPaginationDto } from './dto/user.pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { IngestEventQueueService } from 'src/jobs/queues/ingest-event-queue.service';
import { EventTypeNames } from 'src/helpers/event-type-names.helper';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private verificationRequestService: VerificationRequestService,
    private ingestEventQueueService: IngestEventQueueService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);

    console.log(userExists);

    if (userExists) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(createUserDto.password, salt);

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

    await this.verificationRequestService.createVerificationRequest({
      createVerificationRequestDto: {
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
      },
      expiresIn: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    });

    await this.ingestEventQueueService.execute({
      date: new Date(),
      email: user.email,
      event_type: EventTypeNames.USER_CREATED,
      id: user.id,
      name: user.name,
    });

    return user;
  }

  async findAll(
    userPaginationDto: UserPaginationDto,
  ): Promise<PaginationResultDto<User>> {
    const AND: Prisma.UserWhereInput[] = [];

    if (userPaginationDto.phone) {
      AND.push({
        phone: {
          contains: userPaginationDto.phone,
          mode: 'default',
        },
      });
    }

    if (userPaginationDto.q) {
      AND.push({
        OR: [
          {
            nickname: {
              contains: userPaginationDto.q,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: userPaginationDto.q,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const users = await this.prismaService.user.findMany({
      where: { AND },
      orderBy: [
        { created_at: userPaginationDto.orderByCreatedAt ? 'desc' : undefined },
        { nickname: 'asc' },
      ],
      skip: userPaginationDto.init,
      take: userPaginationDto.limit,
      select: {
        id: true,
        email: true,
        nickname: true,
        name: true,
        phone: true,
        image: true,
        created_at: true,
        updated_at: true,
        email_verified_at: true,
        providers: {
          select: {
            id: true,
            user_id: true,
            created_at: true,
            updated_at: true,
            provider_id: true,
            provider_account_id: true,
            access_token: true,
            refresh_token: true,
            access_token_expires: true,
          },
        },
      },
    });

    return {
      init: userPaginationDto.init,
      limit: userPaginationDto.limit,
      total: users.length,
      results: users,
    };
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
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        providers: true,
      },
    });
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

  async recoverPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password_hash,
      },
    });

    return 'Password recovered';
  }
}
