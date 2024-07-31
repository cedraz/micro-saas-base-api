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
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      display_name: profile.displayName,
      photo: profile.picture,
      provider: profile.provider,
      accessToken,
      refresh_token,
      nickname: profile.name.givenName,
    };

    const token = await this.authService.validateUserOutsideProvider({
      email: user.email,
      nickname: user.nickname,
      name: user.display_name,
      image: user.photo,
      provider_id: user.id,
      provider_account_id: user.id,
      access_token: user.accessToken,
      refresh_token: user.refresh_token,
    });

    done(null, token);
  }
}
