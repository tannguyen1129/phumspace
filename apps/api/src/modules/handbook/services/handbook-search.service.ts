import { Injectable } from '@nestjs/common';

@Injectable()
export class HandbookSearchService {
  /**
   * Chuẩn hóa chuỗi chữ Khmer và văn bản tìm kiếm:
   * 1. Loại bỏ ký tự Zero-Width Space (\u200B).
   * 2. Chuẩn hóa NFC Unicode.
   * 3. Chuyển chữ thường nếu có ký tự Latinh.
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\u200B/g, '') // Remove Zero-Width Space
      .normalize('NFC')
      .trim()
      .toLowerCase();
  }
}
