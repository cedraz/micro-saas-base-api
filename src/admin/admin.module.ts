import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { MasterAuthGuard } from 'src/auth/guards/master-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    AdminAuthGuard,
    MasterAuthGuard,
    JwtAuthGuard,
  ],
  exports: [AdminService],
})
export class AdminModule {}
