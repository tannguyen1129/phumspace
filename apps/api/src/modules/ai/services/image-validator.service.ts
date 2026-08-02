import { Injectable, BadRequestException } from '@nestjs/common';

export interface ValidatedImageFile {
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
}

@Injectable()
export class ImageValidatorService {
  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  validateAndSanitize(file?: Express.Multer.File): ValidatedImageFile {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException({
        errorCode: 'INVALID_IMAGE',
        message: 'Tệp hình ảnh không hợp lệ hoặc rỗng.',
      });
    }

    if (file.buffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException({
        errorCode: 'IMAGE_TOO_LARGE',
        message: 'Kích thước tệp hình ảnh vượt quá giới hạn 5MB.',
      });
    }

    const detectedMime = this.detectMimeFromMagicBytes(file.buffer);
    if (!detectedMime) {
      throw new BadRequestException({
        errorCode: 'UNSUPPORTED_IMAGE_TYPE',
        message: 'Định dạng hình ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG hoặc WebP.',
      });
    }

    return {
      buffer: file.buffer,
      mimeType: detectedMime,
      sizeBytes: file.buffer.length,
    };
  }

  private detectMimeFromMagicBytes(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
    if (buffer.length < 4) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }

    // WebP: RIFF ... WEBP (52 49 46 46 ... 57 45 42 50)
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }

    return null;
  }
}
