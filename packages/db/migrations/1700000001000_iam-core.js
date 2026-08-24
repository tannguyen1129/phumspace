/**
 * Milestone M1: bang loi cua Identity & Access (schema iam).
 * Vai tro (role) tuong ung packages/contracts::USER_ROLES — CHECK constraint la
 * hang rao cuoi cung, ung dung van phai validate truoc khi ghi DB.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "iam", name: "users" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      email: { type: "text", notNull: true, unique: true },
      password_hash: { type: "text", notNull: true },
      display_name: { type: "text", notNull: true },
      role: { type: "text", notNull: true, default: "REGISTERED_USER" },
      preferred_language: { type: "text" },
      interests: { type: "text[]" },
      email_verified_at: { type: "timestamptz" },
      mfa_enabled: { type: "boolean", notNull: true, default: false },
      failed_login_attempts: { type: "integer", notNull: true, default: 0 },
      locked_until: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );

  pgm.addConstraint({ schema: "iam", name: "users" }, "users_role_check", {
    check:
      "role IN ('REGISTERED_USER','TEACHER_ORGANIZER','CONTRIBUTOR','REVIEWER','PUBLISHER','SYSTEM_ADMIN','RESEARCHER')",
  });

  pgm.createTable(
    { schema: "iam", name: "refresh_tokens" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      token_hash: { type: "text", notNull: true, unique: true },
      expires_at: { type: "timestamptz", notNull: true },
      revoked_at: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "iam", name: "refresh_tokens" }, "user_id");

  pgm.createTable(
    { schema: "iam", name: "email_verification_tokens" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      token_hash: { type: "text", notNull: true, unique: true },
      expires_at: { type: "timestamptz", notNull: true },
      consumed_at: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "iam", name: "email_verification_tokens" }, "user_id");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "iam", name: "email_verification_tokens" });
  pgm.dropTable({ schema: "iam", name: "refresh_tokens" });
  pgm.dropTable({ schema: "iam", name: "users" });
};
