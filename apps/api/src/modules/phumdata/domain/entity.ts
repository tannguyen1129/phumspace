import type {
  AccessLevel,
  EntityType,
  PublicationStatus,
  SensitivityLevel,
  VerificationLevel,
} from "@phumspace/contracts";

export interface HeritageEntity {
  id: string;
  canonicalCode: string;
  entityType: EntityType;
  accessLevel: AccessLevel;
  currentVersionId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeritageEntityVersion {
  id: string;
  entityId: string;
  versionNo: number;
  publicationStatus: PublicationStatus;
  verificationLevel: VerificationLevel;
  sensitivityLevel: SensitivityLevel;
  preferredLabel: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface HeritageEntityWithCurrentVersion extends HeritageEntity {
  currentVersion: HeritageEntityVersion | null;
}
