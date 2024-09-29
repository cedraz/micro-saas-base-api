import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api-key')
@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async upsertApiKey(@Request() req) {
    return await this.apiKeyService.upsertApiKey(req.user.id);
  }

  @Get('find-by-admin-id')
  @UseGuards(JwtAuthGuard)
  async findByAdminId(@Request() req) {
    return await this.apiKeyService.findByAdminId(req.user.id);
  }
}
