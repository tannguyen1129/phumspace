import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StoragePort, StoredFileMetadata } from '../ports/storage.port';
import { ContributionMediaType } from '@prisma/client';

@Injectable()
export class ContributionMediaService {
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

  private readonly ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_AUDIO_MIMES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
  ];

  constructor(@Inject('StoragePort') private readonly storagePort: StoragePort) {}

  async validateAndSaveMedia(
    file?: Express.Multer.File,
  ): Promise<{ metadata: StoredFileMetadata; mediaType: ContributionMediaType }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_MEDIA_INVALID',
        message: 'Tệp đính kèm không hợp lệ hoặc bị trống.',
      });
    }

    const mime = file.mimetype.toLowerCase();
    let mediaType: ContributionMediaType;

    if (this.ALLOWED_IMAGE_MIMES.includes(mime)) {
      mediaType = ContributionMediaType.IMAGE;
      if (file.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException({
          errorCode: 'CONTRIBUTION_FILE_TOO_LARGE',
          message: 'Dung lượng hình ảnh vượt quá giới hạn tối đa 10 MB.',
        });
      }
    } else if (this.ALLOWED_AUDIO_MIMES.includes(mime)) {
      mediaType = ContributionMediaType.AUDIO;
      if (file.size > this.MAX_AUDIO_SIZE) {
        throw new BadRequestException({
          errorCode: 'CONTRIBUTION_FILE_TOO_LARGE',
          message: 'Dung lượng tệp âm thanh vượt quá giới hạn tối đa 25 MB.',
        });
      }
    } else {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_UNSUPPORTED_MEDIA_TYPE',
        message: `Định dạng tệp "${file.mimetype}" không được hỗ trợ. Chỉ chấp nhận tệp ảnh (JPEG, PNG, WebP) hoặc âm thanh (MP3, WAV, WebM, OGG).`,
      });
    }

    const metadata = await this.storagePort.saveFile(file);
    return { metadata, mediaType };
  }
}
