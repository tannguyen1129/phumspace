import "reflect-metadata";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { loadEnv } from "@phumspace/config";
import { AppModule } from "./app.module";
import { AI_SCAN_QUEUE_NAME } from "./queues/queue.module";

// Xem giai thich tuong tu o apps/api/src/main.ts.
loadDotenv({ path: resolve(process.cwd(), "../../.env") });

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  // Worker khong phuc vu HTTP — dung application context thay vi NestFactory.create().
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
  console.log(
    `[worker] da khoi dong (${env.NODE_ENV}), dang lang nghe queue "${AI_SCAN_QUEUE_NAME}"`
  );
}

bootstrap().catch((error) => {
  console.error("[worker] khong the khoi dong:", error);
  process.exit(1);
});
