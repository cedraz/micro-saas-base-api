import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

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
}
