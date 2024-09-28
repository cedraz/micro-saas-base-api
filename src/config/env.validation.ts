import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'dev',
  Production = 'prod',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  // Google OAuth credentials
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_AUTH_CALLBACK_URL: string;

  // Mail service credentials
  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsString()
  MAIL_SECURE: string;

  // Google Sheets service account credentials
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_EMAIL?: string;

  @IsString()
  @IsOptional()
  GOOGLE_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  GOOGLE_REDIRECT_URI?: string;

  @IsString()
  @IsOptional()
  GOOGLE_SPREADSHEET_ID?: string;

  // Stripe API keys
  @IsString()
  STRIPE_API_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  const formattedErrors = errors.map((error) => {
    return error.constraints;
  });

  if (errors.length > 0) {
    console.error(formattedErrors);
    throw new Error('Env validation error');
  }

  return validatedConfig;
}
