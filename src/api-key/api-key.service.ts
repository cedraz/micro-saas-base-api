import { ConflictException, Injectable } from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prismaService: PrismaService) {}

  async upsertApiKey(admin_id: string) {
    const apiKey = await this.findByAdminId(admin_id);

    if (apiKey) {
      const apiKeyUpdatedAt = new Date(apiKey.updated_at);
      const apiKeyUpdatedAtPlusOneHour = new Date(
        apiKeyUpdatedAt.setHours(apiKeyUpdatedAt.getHours() + 1),
      );

      if (apiKeyUpdatedAtPlusOneHour > new Date()) {
        throw new ConflictException(
          ErrorMessagesHelper.API_KEY_RECENTLY_UPDATED,
        );
      }
    }

    const uuid = randomUUID();

    return await this.prismaService.apiKey.upsert({
      where: {
        admin_id,
      },
      update: {
        key: uuid,
      },
      create: {
        key: uuid,
        admin_id,
      },
    });
  }

  findByAdminId(admin_id: string) {
    return this.prismaService.apiKey.findUnique({
      where: {
        admin_id,
      },
    });
  }
}
