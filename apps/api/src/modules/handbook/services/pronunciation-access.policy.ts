import { Injectable, ForbiddenException } from '@nestjs/common';
import { PublicationStatus } from '@prisma/client';

@Injectable()
export class PronunciationAccessPolicy {
  /**
   * Kiểm tra quyền phát âm thanh audio công khai cho bản ghi KhmerPronunciation
   */
  validatePublicStreamAccess(pronunciation: any): void {
    if (!pronunciation) {
      throw new ForbiddenException({
        errorCode: 'HANDBOOK_AUDIO_NOT_FOUND',
        message: 'Tệp audio phát âm không tồn tại.',
      });
    }

    if (pronunciation.rightsStatus !== 'PUBLIC_ALLOWED') {
      throw new ForbiddenException({
        errorCode: 'HANDBOOK_AUDIO_ACCESS_DENIED',
        message: 'Tệp audio phát âm chưa được cấp quyền phát công khai (rightsStatus restricted).',
      });
    }

    if (pronunciation.termVersion?.publicationStatus !== PublicationStatus.PUBLISHED) {
      throw new ForbiddenException({
        errorCode: 'HANDBOOK_AUDIO_ACCESS_DENIED',
        message: 'Từ vựng đính kèm tệp phát âm chưa được xuất bản chính thức.',
      });
    }
  }
}
