import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const canActivate = await super.canActivate(context);

      if (!canActivate) {
        throw new UnauthorizedException(ErrorMessagesHelper.UNAUTHORIZED);
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException(ErrorMessagesHelper.UNAUTHORIZED);
      }

      if (!user.role) {
        throw new ForbiddenException(ErrorMessagesHelper.FORBIDDEN);
      }

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new HttpException(ErrorMessagesHelper.INTERNAL_SERVER_ERROR, 500);
    }
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException(ErrorMessagesHelper.UNAUTHORIZED);
    }
    return user;
  }
}
