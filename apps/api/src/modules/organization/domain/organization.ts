import type { OrganizationMemberRole, OrganizationStatus, OrganizationType } from "@phumspace/contracts";

export interface Organization {
  id: string;
  name: string;
  orgType: OrganizationType;
  status: OrganizationStatus;
  brandColor: string | null;
  homePlaceId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  createdAt: Date;
}

export interface OrganizationMemberView extends OrganizationMembership {
  displayName: string;
  email: string;
}

/** Bao cao pham vi to chuc (FR-ORG-003/004) — chi tinh trong cac competition thuoc to chuc nay. */
export interface OrganizationCompetitionReport {
  competitionId: string;
  title: string;
  status: string;
  participantCount: number;
  submissionCount: number;
  correctSubmissionCount: number;
}
