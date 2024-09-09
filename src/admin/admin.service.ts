import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { Admin } from './entities/admin.entity';
import { Prisma } from '@prisma/client';
import { AdminPaginationDto } from './dto/admin.pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prismaService: PrismaService) {}

  findByEmail(email: string) {
    return this.prismaService.admin.findUnique({
      where: {
        email,
      },
    });
  }

  findById(id: string) {
    return this.prismaService.admin.findUnique({
      where: {
        id,
      },
      select: {
        role: true,
        created_at: true,
        email: true,
        id: true,
        name: true,
        updated_at: true,
      },
    });
  }

  async createMasterAdmin(createAdminDto: CreateAdminDto) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(createAdminDto.password, salt);

    return this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password_hash,
        role: 'MASTER',
      },
    });
  }

  async createCommonAdmin(createAdminDto: CreateAdminDto) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(createAdminDto.password, salt);

    return this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password_hash,
        role: 'COMMON',
      },
    });
  }

  async recoverPassword({ email, password }) {
    const admin = await this.findByEmail(email);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await this.prismaService.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password_hash,
      },
    });
  }

  async findAll(
    adminPaginationDto: AdminPaginationDto,
  ): Promise<PaginationResultDto<Admin>> {
    const AND: Prisma.AdminWhereInput[] = [];

    if (adminPaginationDto.q) {
      AND.push({
        OR: [
          {
            name: {
              contains: adminPaginationDto.q,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const admins = await this.prismaService.admin.findMany({
      where: { AND },
      orderBy: [
        {
          created_at: adminPaginationDto.orderByCreatedAt ? 'desc' : undefined,
        },
        { name: 'asc' },
      ],
      skip: adminPaginationDto.init,
      take: adminPaginationDto.limit,
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
        role: true,
      },
    });

    return {
      init: adminPaginationDto.init,
      limit: adminPaginationDto.limit,
      total: admins.length,
      results: admins,
    };
  }

  async delete(id: string) {
    await this.prismaService.admin.delete({
      where: {
        id,
      },
    });
  }

  async updateProfile(id: string, data: UpdateAdminDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: {
        id,
      },
    });

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    return this.prismaService.admin.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }
}
