import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { IngestEventDto } from 'src/common/dto/ingest-event.dto';
import { QueueNames } from '../utils/queue-names.helper';

@Injectable()
export class IngestEventQueueService {
  constructor(
    @InjectQueue(QueueNames.INGEST_EVENT_QUEUE)
    private ingestEventQueue: Queue,
  ) {}

  async execute({ date, email, name, event_type, id }: IngestEventDto) {
    await this.ingestEventQueue.add(QueueNames.INGEST_EVENT_QUEUE, {
      date,
      email,
      name,
      event_type,
      id,
    });
  }
}
