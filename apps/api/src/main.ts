import "reflect-metadata";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { loadEnv } from "@phumspace/config";
import { AppModule } from "./app.module";

// Local dev (pnpm --filter @phumspace/api run start:dev) chay tu cwd=apps/api va can .env
// o root repo. Trong Docker Compose, bien moi truong da duoc inject truc tiep nen file .env
// khong ton tai trong container — dotenv im lang bo qua, khong throw.
loadDotenv({ path: resolve(process.cwd(), "../../.env") });

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  // CORS allowlist thay vi wildcard (System Design muc 16.1 "strict CORS allowlist") — chi
  // nguon web chinh thuc (WEB_BASE_URL) duoc phep goi API tu trinh duyet.
  app.enableCors({ origin: env.WEB_BASE_URL });
  app.setGlobalPrefix("v1", { exclude: ["health"] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
  );

  await app.listen(env.API_PORT);
  console.log(`[api] dang lang nghe tren cong ${env.API_PORT} (${env.NODE_ENV})`);
}

bootstrap().catch((error) => {
  console.error("[api] khong the khoi dong:", error);
  process.exit(1);
});
