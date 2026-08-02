import { ContributionStatus } from '@prisma/client';

export class ContributionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ContributionStatus, ContributionStatus[]> = {
    DRAFT: [ContributionStatus.SUBMITTED, ContributionStatus.WITHDRAWN],
    SUBMITTED: [ContributionStatus.UNDER_REVIEW, ContributionStatus.WITHDRAWN],
    UNDER_REVIEW: [
      ContributionStatus.NEEDS_MORE_INFORMATION,
      ContributionStatus.APPROVED,
      ContributionStatus.REJECTED,
      ContributionStatus.WITHDRAWN,
    ],
    NEEDS_MORE_INFORMATION: [ContributionStatus.SUBMITTED, ContributionStatus.WITHDRAWN],
    APPROVED: [ContributionStatus.PUBLISHED, ContributionStatus.WITHDRAWN],
    REJECTED: [],
    WITHDRAWN: [],
    PUBLISHED: [],
  };

  /**
   * Kiểm tra xem việc chuyển dịch từ currentStatus -> targetStatus có hợp lệ hay không
   */
  static canTransition(from: ContributionStatus, to: ContributionStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Kiểm tra xem Guest user có quyền chuyển dịch trạng thái hay không (Public Guest API)
   */
  static isGuestAllowedTransition(from: ContributionStatus, to: ContributionStatus): boolean {
    if (to === ContributionStatus.WITHDRAWN) {
      const allowed: ContributionStatus[] = [
        ContributionStatus.DRAFT,
        ContributionStatus.SUBMITTED,
        ContributionStatus.NEEDS_MORE_INFORMATION,
      ];
      return allowed.includes(from);
    }

    if (to === ContributionStatus.SUBMITTED) {
      const allowed: ContributionStatus[] = [
        ContributionStatus.DRAFT,
        ContributionStatus.NEEDS_MORE_INFORMATION,
      ];
      return allowed.includes(from);
    }

    return false;
  }
}
