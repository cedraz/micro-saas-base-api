import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminService } from 'src/admin/admin.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class MasterAuthGuard extends JwtAuthGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const canActivate = await super.canActivate(context);
      console.log('Resultado de super.canActivate:', canActivate);
      if (!canActivate) {
        throw new UnauthorizedException(ErrorMessagesHelper.UNAUTHORIZED);
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      console.log('Usuário extraído do request:', user);

      if (!user) {
        throw new UnauthorizedException(ErrorMessagesHelper.UNAUTHORIZED);
      }

      if (user.role !== 'MASTER') {
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
