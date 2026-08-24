import { Global, Module } from "@nestjs/common";
import { S3_CLIENT, s3ClientProvider } from "./s3-client.provider";
import { MediaStorageService } from "./media-storage.service";

export { S3_CLIENT };

@Global()
@Module({
  providers: [s3ClientProvider, MediaStorageService],
  exports: [S3_CLIENT, MediaStorageService],
})
export class StorageModule {}
