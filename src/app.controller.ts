import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: 'Test API health',
  })
  @Get()
  getHello() {
    return {
      message: 'hello world!',
    };
  }
}
