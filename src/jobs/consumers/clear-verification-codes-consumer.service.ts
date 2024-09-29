import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClearVerificationRequestsDto } from '../dto/clear-verification-requests.dto';

@Processor(QueueNames.CLEAR_VERIFICATION_REQUESTS_QUEUE)
export class ClearVerificationRequestsConsumerService extends WorkerHost {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async process({ data }: Job<ClearVerificationRequestsDto>) {
    await this.prismaService.verificationRequest.deleteMany({
      where: {
        id: {
          in: data.expiredVerificationRequests.map((v) => v.id),
        },
      },
    });
  }
}
