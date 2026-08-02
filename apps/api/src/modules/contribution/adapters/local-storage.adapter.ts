import { Injectable, Logger } from '@nestjs/common';
import { StoragePort, StoredFileMetadata } from '../ports/storage.port';
import { randomUUID, createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly storageDir = path.resolve(process.cwd(), 'storage/contributions');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      this.logger.log(`Created private contribution storage directory at ${this.storageDir}`);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<StoredFileMetadata> {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const storageKey = `contrib_${randomUUID()}${ext}`;
    const targetPath = path.join(this.storageDir, storageKey);

    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    await fs.promises.writeFile(targetPath, file.buffer);

    return {
      storageKey,
      originalFileName: path.basename(file.originalname),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.storageDir, safeKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getFileStream(storageKey: string): Promise<NodeJS.ReadableStream | null> {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.storageDir, safeKey);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.createReadStream(filePath);
  }
}
