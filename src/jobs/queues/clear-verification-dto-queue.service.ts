import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ClearVerificationRequestsQueueService {
  constructor(
    @InjectQueue(QueueNames.CLEAR_VERIFICATION_REQUESTS_QUEUE)
    private clearVerificationRequestsQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  @Cron('* 59 23 * * *') // Run every day at 23:59
  async execute() {
    const expiredVerificationRequests =
      await this.prismaService.verificationRequest.findMany({
        where: {
          expires: {
            lte: new Date(),
          },
        },
      });

    if (expiredVerificationRequests.length !== 0) {
      await this.clearVerificationRequestsQueue.add(
        QueueNames.CLEAR_VERIFICATION_REQUESTS_QUEUE,
        {
          expiredVerificationRequests,
        },
      );
    }
  }
}
