import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AdminService } from 'src/admin/admin.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  findProviderByProviderIdAndAccountId(
    providerId: string,
    providerAccountId: string,
  ) {
    return this.prismaService.provider.findUnique({
      where: {
        provider_id_provider_account_id: {
          provider_id: providerId,
          provider_account_id: providerAccountId,
        },
      },
    });
  }

  async validateUserOutsideProvider(createAuthDto: CreateAuthDto) {
    const user = await this.userService.findByEmail(createAuthDto.email);

    if (!user) {
      const newUser = await this.userService.create({
        email: createAuthDto.email,
        nickname: createAuthDto.nickname,
        name: createAuthDto.name,
        phone: createAuthDto.phone,
        password: '',
      });

      const provider = await this.prismaService.provider.create({
        data: {
          provider_id: createAuthDto.provider_id,
          provider_account_id: createAuthDto.provider_account_id,
          user_id: newUser.id,
        },
      });

      return {
        user: newUser,
        provider,
      };
    }

    const providerExists = await this.findProviderByProviderIdAndAccountId(
      createAuthDto.provider_id,
      createAuthDto.provider_account_id,
    );

    if (providerExists) {
      return user;
    }

    const updatedUser = await this.userService.updateProviders(user.id, {
      provider_account_id: createAuthDto.provider_account_id,
      provider_id: createAuthDto.provider_id,
      access_token: createAuthDto.access_token,
      access_token_expires: createAuthDto.access_token_expires,
      refresh_token: createAuthDto.refresh_token,
    });

    const accessTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    return {
      updatedUser,
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    if (!user.email_verified_at) {
      console.log(user.email_verified_at);
      throw new UnauthorizedException(ErrorMessagesHelper.EMAIL_NOT_VERIFIED);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS);
    }

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return {
      userWithoutPassword,
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminService.findByEmail(loginDto.email);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS);
    }

    const accessTokenPayload = {
      sub: admin.id,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours
      role: admin.role,
    };

    const refreshTokenPayload = {
      sub: admin.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    return {
      admin,
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    };
  }

  async adminRefreshAccessToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    const admin = await this.adminService.findById(payload.sub);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const accessTokenPayload = {
      sub: admin.id,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours
      role: admin.role,
    };

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refreshToken: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    };
  }
}
