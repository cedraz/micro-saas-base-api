import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class DomainGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const origin = request.headers.origin || request.headers.referer;

    const allowedDomain = this.configService.get('ALLOWED_DOMAIN');

    if (origin && origin.includes(allowedDomain)) {
      return true;
    } else {
      throw new ForbiddenException('Access denied from this domain');
    }
  }
}
