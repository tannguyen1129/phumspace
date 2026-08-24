import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { loadEnv } from "@phumspace/config";
import { ScannerModule } from "../modules/scanner/scanner.module";
import { ScanJobProcessor } from "./scan-job.processor";

export const AI_SCAN_QUEUE_NAME = "ai-scan";

/**
 * Dang ky BullMQ Worker cho queue "ai-scan" luc module khoi tao va dong connection
 * gon gang luc app shutdown. Cac queue khac (media processing, TTS, notification —
 * xem System Design Document muc "worker") se duoc them theo tung milestone tuong ung.
 */
@Module({
  imports: [ScannerModule],
  providers: [ScanJobProcessor],
})
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;
  private connection?: IORedis;

  constructor(private readonly scanJobProcessor: ScanJobProcessor) {}

  onModuleInit(): void {
    const env = loadEnv();
    // maxRetriesPerRequest: null la yeu cau bat buoc cua BullMQ cho blocking connection.
    this.connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

    this.worker = new Worker(
      AI_SCAN_QUEUE_NAME,
      async (job: Job) => this.scanJobProcessor.process(job.id ?? "unknown", job.data),
      { connection: this.connection }
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.connection?.quit();
  }
}
