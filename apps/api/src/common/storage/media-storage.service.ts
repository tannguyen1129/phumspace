import { createHash, randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import sharp from "sharp";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { loadEnv } from "@phumspace/config";
import { S3_CLIENT } from "./s3-client.provider";
import { PG_POOL } from "../database/database.module";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
};

const DEFAULT_PRESIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * MediaStorageService — upload nguyen anh/audio len object storage (MinIO o local/MVP), dung
 * chung cho moi module can luu file (Scanner, Handbook, ...).
 */
@Injectable()
export class MediaStorageService {
  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client,@Inject(PG_POOL) private readonly pool:Pool) {}

  async upload(buffer: Buffer, mimeType: string, keyPrefix: string): Promise<string> {
    const env = loadEnv();
    const extension = EXTENSION_BY_MIME[mimeType] ?? "bin";
    const key = `${keyPrefix}/${randomUUID()}.${extension}`;
    await this.s3Client.send(
      new PutObjectCommand({ Bucket: env.MEDIA_BUCKET, Key: key, Body: buffer, ContentType: mimeType })
    );
    let width:number|undefined,height:number|undefined;
    if(mimeType.startsWith("image/")){const metadata=await sharp(buffer).metadata();width=metadata.width;height=metadata.height;}
    const checksum=createHash("sha256").update(buffer).digest("hex");
    const asset=await this.pool.query<{id:string}>(`INSERT INTO ops.media_assets(storage_key,mime_type,size_bytes,checksum_sha256,width,height) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(storage_key) DO UPDATE SET storage_key=EXCLUDED.storage_key RETURNING id`,[key,mimeType,buffer.length,checksum,width??null,height??null]);
    if(mimeType.startsWith("image/")){const thumb=await sharp(buffer).rotate().resize({width:480,height:480,fit:"inside",withoutEnlargement:true}).webp({quality:78}).toBuffer();const thumbKey=`${keyPrefix}/derivatives/${randomUUID()}-thumb-v1.webp`;await this.s3Client.send(new PutObjectCommand({Bucket:env.MEDIA_BUCKET,Key:thumbKey,Body:thumb,ContentType:"image/webp"}));const meta=await sharp(thumb).metadata();await this.pool.query(`INSERT INTO ops.media_assets(storage_key,mime_type,size_bytes,checksum_sha256,width,height,derivative_of,derivative_type,version) VALUES($1,'image/webp',$2,$3,$4,$5,$6,'THUMBNAIL',1)`,[thumbKey,thumb.length,createHash("sha256").update(thumb).digest("hex"),meta.width??null,meta.height??null,asset.rows[0].id]);}
    return key;
  }

  /**
   * Signed URL (System Design "Object Storage: Signed URL cho tep") — the <audio>/<img> khong
   * gui duoc Authorization header nen khong the dung JwtAuthGuard truc tiep tren file; thay vao
   * do API tra ve URL co chu ky het han sau `expiresInSeconds`, client dung thang lam src.
   */
  async getPresignedUrl(key: string, expiresInSeconds = DEFAULT_PRESIGNED_URL_TTL_SECONDS): Promise<string> {
    const env = loadEnv();
    const command = new GetObjectCommand({ Bucket: env.MEDIA_BUCKET, Key: key });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }

  /** Xoa vinh vien 1 doi tuong — dung khi user thuc hien quyen xoa du lieu ca nhan (FR-PER-002/007). */
  async delete(key: string): Promise<void> {
    const env = loadEnv();
    await this.s3Client.send(new DeleteObjectCommand({ Bucket: env.MEDIA_BUCKET, Key: key }));
  }
}
