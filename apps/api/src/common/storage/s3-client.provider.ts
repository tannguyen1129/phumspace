import type { Provider } from "@nestjs/common";
import { S3Client } from "@aws-sdk/client-s3";
import { loadEnv } from "@phumspace/config";

/**
 * Token + provider S3Client tach rieng file — storage.module.ts va media-storage.service.ts
 * deu import tu day thay vi import lan nhau, tranh circular import lam S3_CLIENT bi undefined
 * luc NestJS resolve DI (CommonJS circular require tra ve module.exports chua hoan tat).
 */
export const S3_CLIENT = Symbol("S3_CLIENT");

export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  useFactory: (): S3Client => {
    const env = loadEnv();
    return new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: { accessKeyId: env.MINIO_ROOT_USER, secretAccessKey: env.MINIO_ROOT_PASSWORD },
      // MinIO dung path-style (http://host:9000/bucket/key) thay vi virtual-hosted-style.
      forcePathStyle: true,
    });
  },
};
