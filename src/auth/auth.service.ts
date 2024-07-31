import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
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
        image: createAuthDto.image,
        password: '',
      });

      const provider = await this.prismaService.provider.create({
        data: {
          provider_id: createAuthDto.provider_id,
          provider_account_id: createAuthDto.provider_account_id,
          user_id: user.id,
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
      provider_id: createAuthDto.provider_id,
      provider_account_id: createAuthDto.provider_account_id,
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
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    const accessTokenPayload = {
      sub: user.id,
      nickname: user.nickname,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    return {
      user,
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
}
