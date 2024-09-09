import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MasterAuthGuard } from 'src/auth/guards/master-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateAdminAuthGuard } from 'src/auth/guards/create-admin-auth.guard';
import { PasswordRecoveryAuthGuard } from 'src/auth/guards/password-recovery.guard';
import { AdminPaginationDto } from './dto/admin.pagination.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Ger all admins',
  })
  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() pagination: AdminPaginationDto) {
    return this.adminService.findAll(pagination);
  }

  @ApiOperation({
    summary: 'Search for an admin by ID',
  })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AdminAuthGuard)
  findById(@Param('id') id: string) {
    return this.adminService.findById(id);
  }

  @ApiOperation({
    summary: 'Create a master admin (only for master admins)',
  })
  @ApiBearerAuth()
  @Post('create-master')
  @UseGuards(MasterAuthGuard)
  createMasterAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createMasterAdmin(createAdminDto);
  }

  @ApiOperation({
    summary: 'Create a common admin',
  })
  @Post()
  @UseGuards(CreateAdminAuthGuard)
  createCommonAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createCommonAdmin(createAdminDto);
  }

  @ApiOperation({
    summary: 'Recover password',
  })
  @Post('recover-password')
  @UseGuards(AdminAuthGuard, PasswordRecoveryAuthGuard)
  @ApiBearerAuth()
  recoverPassword(@Body() password: string, @Request() req) {
    return this.adminService.recoverPassword({
      email: req.user.email,
      password: password,
    });
  }

  @ApiOperation({
    summary: 'Get logged admin profile',
  })
  @Get('profile')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.adminService.findById(req.user.id);
  }

  @ApiOperation({
    summary: 'Delete logged admin profile',
  })
  @Delete('profile')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  deleteProfile(@Request() req) {
    return this.adminService.delete(req.user.id);
  }

  @ApiOperation({
    summary: 'Delete admin (only for master admins)',
  })
  @Delete()
  @UseGuards(MasterAuthGuard)
  @ApiBearerAuth()
  deleteAdmin(@Body() id: string) {
    return this.adminService.delete(id);
  }

  @ApiOperation({
    summary: 'Update logged admin profile',
  })
  @Put('profile')
  @UseGuards(AdminAuthGuard)
  updateProfile(@Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    return this.adminService.updateProfile(req.user.id, updateAdminDto);
  }
}
