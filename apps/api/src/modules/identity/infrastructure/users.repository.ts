import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { UserRole } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { AccessibilityPreferences, NotificationPreferences, User } from "../domain/user";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  preferred_language: string | null;
  interests: string[] | null;
  accessibility_preferences: AccessibilityPreferences | null;
  notification_preferences: NotificationPreferences;
  email_verified_at: Date | null;
  mfa_enabled: boolean;
  mfa_secret_encrypted: string | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    role: row.role,
    preferredLanguage: row.preferred_language,
    interests: row.interests,
    accessibilityPreferences: row.accessibility_preferences,
    notificationPreferences: row.notification_preferences ?? {},
    emailVerifiedAt: row.email_verified_at,
    mfaEnabled: row.mfa_enabled,
    mfaSecretEncrypted: row.mfa_secret_encrypted,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    const { rows } = await this.pool.query<UserRow>(
      `INSERT INTO iam.users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.email.toLowerCase(), input.passwordHash, input.displayName]
    );
    return mapRow(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT * FROM iam.users WHERE email = $1`, [
      email.toLowerCase(),
    ]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT * FROM iam.users WHERE id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async updatePreferences(
    id: string,
    input: {
      preferredLanguage?: string;
      interests?: string[];
      accessibilityPreferences?: AccessibilityPreferences;
      displayName?: string;
      notificationPreferences?: NotificationPreferences;
    }
  ): Promise<User> {
    const { rows } = await this.pool.query<UserRow>(
      `UPDATE iam.users
       SET display_name = COALESCE($2, display_name),
           preferred_language = COALESCE($3, preferred_language),
           interests = COALESCE($4, interests),
           accessibility_preferences = COALESCE($5, accessibility_preferences),
           notification_preferences = COALESCE($6, notification_preferences),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        input.displayName ?? null,
        input.preferredLanguage ?? null,
        input.interests ?? null,
        input.accessibilityPreferences ? JSON.stringify(input.accessibilityPreferences) : null,
        input.notificationPreferences ? JSON.stringify(input.notificationPreferences) : null,
      ]
    );
    return mapRow(rows[0]);
  }

  /**
   * An danh hoa tai khoan thay vi hard-delete (FR-PER-007) — nhieu bang khac (contributions,
   * entities, terms...) tham chieu iam.users(id) khong co ON DELETE CASCADE, va noi dung da
   * publish can giu attribution/audit trail. Email doi sang dang khong the dang nhap lai duoc.
   */
  async anonymize(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.users
       SET email = 'deleted-' || id::text || '@phumspace.invalid',
           password_hash = encode(gen_random_bytes(32), 'hex'),
           display_name = 'Nguoi dung da xoa',
           preferred_language = NULL,
           interests = NULL,
           accessibility_preferences = NULL,
           deleted_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [id]
    );
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.users SET email_verified_at = now(), updated_at = now() WHERE id = $1`,
      [id]
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.users SET password_hash=$2, failed_login_attempts=0, locked_until=NULL, updated_at=now() WHERE id=$1`,
      [id, passwordHash]
    );
  }

  async setMfa(id: string, encryptedSecret: string | null, enabled: boolean): Promise<void> {
    await this.pool.query(`UPDATE iam.users SET mfa_secret_encrypted=$2,mfa_enabled=$3,updated_at=now() WHERE id=$1`, [id, encryptedSecret, enabled]);
  }

  async recordFailedLogin(id: string, lockUntil: Date | null): Promise<void> {
    await this.pool.query(
      `UPDATE iam.users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = $2,
           updated_at = now()
       WHERE id = $1`,
      [id, lockUntil]
    );
  }

  async resetFailedLogins(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.users SET failed_login_attempts = 0, locked_until = NULL, updated_at = now() WHERE id = $1`,
      [id]
    );
  }
}
