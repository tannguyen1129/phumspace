import type { UserRole } from "@phumspace/contracts";

export interface AccessibilityPreferences {
  reducedMotion?: boolean;
  largeText?: boolean;
}

export interface NotificationPreferences {
  inApp?: boolean;
  email?: boolean;
  festivalUpdates?: boolean;
  securityAlerts?: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  preferredLanguage: string | null;
  interests: string[] | null;
  accessibilityPreferences: AccessibilityPreferences | null;
  notificationPreferences: NotificationPreferences;
  emailVerifiedAt: Date | null;
  mfaEnabled: boolean;
  mfaSecretEncrypted: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** Khong bao gio tra passwordHash ra khoi module — dung type nay o moi response huong ngoai. */
export type PublicUser = Omit<User, "passwordHash" | "mfaSecretEncrypted">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, mfaSecretEncrypted: _mfaSecret, ...rest } = user;
  return rest;
}
