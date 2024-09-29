import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
// import { AuthProviderEnum } from 'src/common/enums/auth-provider.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_AUTH_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const admin = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      photo: profile.photos[0].value,
      provider: profile.provider,
      accessToken,
      refresh_token,
    };

    const token = await this.authService.validateAdminOutsideProvider({
      email: admin.email,
      name: admin.name,
      image: admin.photo,
      provider_id: admin.id,
      provider_account_id: admin.id,
      access_token: admin.accessToken,
      refresh_token: admin.refresh_token,
    });

    done(null, token);
  }
}
