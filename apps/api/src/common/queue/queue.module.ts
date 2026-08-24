import { Global, Inject, Module, type OnModuleDestroy, type Provider } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { loadEnv } from "@phumspace/config";

/** Ten queue dung chung giua apps/api (enqueue) va apps/worker (consume) — xem apps/worker/src/queues. */
export const AI_SCAN_QUEUE_NAME = "ai-scan";
export const AI_SCAN_QUEUE = Symbol("AI_SCAN_QUEUE");

const aiScanQueueProvider: Provider = {
  provide: AI_SCAN_QUEUE,
  useFactory: (): Queue => {
    const env = loadEnv();
    const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
    return new Queue(AI_SCAN_QUEUE_NAME, { connection });
  },
};

@Global()
@Module({
  providers: [aiScanQueueProvider],
  exports: [AI_SCAN_QUEUE],
})
export class QueueModule implements OnModuleDestroy {
  constructor(@Inject(AI_SCAN_QUEUE) private readonly queue: Queue) {}

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
