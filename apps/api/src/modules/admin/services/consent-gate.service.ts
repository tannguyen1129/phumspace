import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ConsentGateService {
  /**
   * Kiểm tra điều kiện Consent Gate trước khi chuyển đóng góp sang APPROVED hoặc PUBLISHED
   */
  validateConsentGate(consent?: any): void {
    if (!consent) {
      throw new BadRequestException({
        errorCode: 'ADMIN_CONSENT_NOT_SUFFICIENT',
        message: 'Bài đóng góp thiếu thông tin xác nhận tác quyền và chấp thuận consent.',
      });
    }

    if (consent.withdrawnAt) {
      throw new BadRequestException({
        errorCode: 'ADMIN_CONSENT_NOT_SUFFICIENT',
        message: 'Người đóng góp đã rút consent (withdrawnAt). Không thể phê duyệt bài đóng góp này.',
      });
    }

    if (!consent.contributorOwnsRights) {
      throw new BadRequestException({
        errorCode: 'ADMIN_CONSENT_NOT_SUFFICIENT',
        message: 'Người đóng góp không xác nhận sở hữu tác quyền hoặc quyền cung cấp nội dung.',
      });
    }

    if (!consent.allowPublicDisplay) {
      throw new BadRequestException({
        errorCode: 'ADMIN_CONSENT_NOT_SUFFICIENT',
        message: 'Người đóng góp không cho phép hiển thị công khai (allowPublicDisplay = false). Bài đóng góp chỉ được lưu kho nội bộ.',
      });
    }
  }
}
