import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleOAuthGuard } from './guards/google.guard';
import { Request as ExpressRequest } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/signin')
  @ApiOperation({ summary: 'Inicia autenticação com o google.' })
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return { message: 'Autenticação com o google bem sucedida' };
  }

  @Get('google/redirect')
  @ApiResponse({
    headers: {
      'Set-Cookie': {
        description: 'Refresh token',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @UseGuards(GoogleOAuthGuard)
  handleRedirect(
    @Request() req: ExpressRequest,
    // @Request()
    // req: ExpressRequest & {
    //   user: { access_token: string; refresh_token: string };
    // },
    // @Res({ passthrough: true }) res: Response,
  ): { access_token: string } {
    console.log(req);

    return {
      access_token: 'qualquer coisa',
    };
    // const { access_token, refresh_token } = req.user;

    // res.cookie('refresh_token', refresh_token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    // });

    // return { access_token };
  }

  @Post()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
