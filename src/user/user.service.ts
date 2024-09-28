import {
  ConflictException,
  forwardRef,
  Inject,
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
import { FindUserByStripeInfoDto } from './dto/find-user-by-stripe-info.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { CreateProviderDto } from 'src/auth/dto/create-provider.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private verificationRequestService: VerificationRequestService,
    private ingestEventQueueService: IngestEventQueueService,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.findByEmail(createUserDto.email);

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
        password_hash: password_hash,
      },
      select: {
        stripe_customer_id: false,
        stripe_price_id: false,
        stripe_subscription_id: false,
        stripe_subscription_status: false,
        email: true,
        id: true,
        email_verified_at: true,
        name: true,
        nickname: true,
        phone: true,
        created_at: true,
        updated_at: true,
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

    await this.stripeService.createCustomer({
      email: user.email,
      name: user.name,
      user_id: user.id,
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

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        providers: true,
      },
    });
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
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        image: updateUserDto.image,
        name: updateUserDto.name,
        email_verified_at: updateUserDto.email_verified_at,
        nickname: updateUserDto.nickname,
        stripe_customer_id: updateUserDto.stripe_customer_id,
        stripe_subscription_id: updateUserDto.stripe_subscription_id,
        stripe_price_id: updateUserDto.stripe_price_id,
        stripe_subscription_status: updateUserDto.stripe_subscription_status,
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

  async getUsersStripeInfo(id: string) {
    const usersStripeInfo = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        stripe_price_id: true,
        stripe_subscription_id: true,
        stripe_subscription_status: true,
        stripe_customer_id: true,
      },
    });

    if (!usersStripeInfo.stripe_price_id) {
      throw new NotFoundException(
        ErrorMessagesHelper.USERS_STRIPE_PLAN_NOT_FOUND,
      );
    }

    return usersStripeInfo;
  }

  async findUserByStripeInfo({
    stripe_customer_id,
    stripe_subscription_id,
  }: FindUserByStripeInfoDto) {
    return await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            stripe_subscription_id,
          },
          {
            stripe_customer_id,
          },
        ],
      },
      select: {
        id: true,
      },
    });
  }
}
