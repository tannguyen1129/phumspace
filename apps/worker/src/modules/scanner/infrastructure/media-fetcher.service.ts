import { Inject, Injectable } from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { loadEnv } from "@phumspace/config";
import { S3_CLIENT } from "../../../common/storage/storage.module";

@Injectable()
export class MediaFetcherService {
  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client) {}

  async fetchImage(mediaKey: string): Promise<Buffer> {
    const env = loadEnv();
    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: env.MEDIA_BUCKET, Key: mediaKey }),
    );
    const body = response.Body;
    if (!body) {
      throw new Error(`Khong doc duoc media "${mediaKey}" tu object storage.`);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Buffer | Uint8Array>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  async deleteImage(mediaKey: string): Promise<void> {
    const env = loadEnv();
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: env.MEDIA_BUCKET, Key: mediaKey }),
    );
  }
}
