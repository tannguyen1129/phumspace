/**
 * Milestone M10 (GD2): Festival Mode day du — FR-FES-002..006 (SHOULD/R2).
 * Khong tao bang "revision" rieng cho lich (FR-FES-003 "quan ly theo phien ban") — tai dung
 * ops.audit_events san co lam lich su thay doi trang thai occurrence, dung pattern da dung cho
 * Contribution/Moderation tu M5 (nhat quan hon la them 1 bang moi chi de luu history).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "place", name: "festival_facilities" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      occurrence_id: {
        type: "uuid",
        notNull: true,
        references: '"place"."festival_occurrences"',
        onDelete: "CASCADE",
      },
      facility_type: { type: "text", notNull: true },
      note: { type: "text" },
      latitude: { type: "double precision" },
      longitude: { type: "double precision" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "place", name: "festival_facilities" },
    "festival_facilities_type_check",
    { check: "facility_type IN ('PARKING','MEDICAL','RESTROOM','VIEWING_POINT','SAFETY_WARNING')" }
  );
  pgm.createIndex({ schema: "place", name: "festival_facilities" }, "occurrence_id");

  pgm.createTable(
    { schema: "place", name: "boat_teams" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      // Nullable: doi ghe co the chua thuoc to chuc nao da dang ky chinh thuc.
      organization_id: { type: "uuid", references: '"iam"."organizations"' },
      display_name: { type: "text", notNull: true },
      home_place_id: { type: "uuid", references: '"heritage"."entities"' },
      symbol_color: { type: "text" },
      // Cau chuyen da duyet — KHONG co truong thanh vien ca nhan (FR-FES-004 "khong cong khai
      // du lieu ca nhan nhay cam cua thanh vien").
      story: { type: "text" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );

  pgm.createTable(
    { schema: "experience", name: "follows" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      target_type: { type: "text", notNull: true },
      target_id: { type: "uuid", notNull: true },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "experience", name: "follows" }, "follows_target_type_check", {
    check: "target_type IN ('FESTIVAL','BOAT_TEAM')",
  });
  pgm.addConstraint({ schema: "experience", name: "follows" }, "follows_unique", {
    unique: ["user_id", "target_type", "target_id"],
  });

  pgm.createTable(
    { schema: "ops", name: "notifications" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      title: { type: "text", notNull: true },
      body: { type: "text", notNull: true },
      priority: { type: "text", notNull: true, default: "NORMAL" },
      target_type: { type: "text" },
      target_id: { type: "uuid" },
      expires_at: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      read_at: { type: "timestamptz" },
    }
  );
  pgm.addConstraint({ schema: "ops", name: "notifications" }, "notifications_priority_check", {
    check: "priority IN ('NORMAL','URGENT')",
  });
  pgm.createIndex({ schema: "ops", name: "notifications" }, "user_id");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "ops", name: "notifications" });
  pgm.dropTable({ schema: "experience", name: "follows" });
  pgm.dropTable({ schema: "place", name: "boat_teams" });
  pgm.dropTable({ schema: "place", name: "festival_facilities" });
};
