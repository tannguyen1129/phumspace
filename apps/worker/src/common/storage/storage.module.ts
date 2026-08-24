import { Global, Module, type Provider } from "@nestjs/common";
import { S3Client } from "@aws-sdk/client-s3";
import { loadEnv } from "@phumspace/config";

/** Mirror cua apps/api/src/common/storage/storage.module.ts — worker can tai anh ve de goi Gemini. */
export const S3_CLIENT = Symbol("S3_CLIENT");

const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  useFactory: (): S3Client => {
    const env = loadEnv();
    return new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: { accessKeyId: env.MINIO_ROOT_USER, secretAccessKey: env.MINIO_ROOT_PASSWORD },
      forcePathStyle: true,
    });
  },
};

@Global()
@Module({
  providers: [s3ClientProvider],
  exports: [S3_CLIENT],
})
export class StorageModule {}
