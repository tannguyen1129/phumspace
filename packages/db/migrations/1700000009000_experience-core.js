/**
 * Milestone M6: Personalization, Offline, Hardening (docs muc 7.3 FR-PER-001..008).
 *
 * "saved_items" gop chung Place/thuc the van hoa (deu la heritage.entities) va Handbook term
 * vao 1 bang, phan biet qua entity_id/term_id (dung 1 trong 2 — xem CHECK). Idempotent qua
 * unique index rieng cho tung cot: goi save() 2 lan cho cung 1 muc khong tao ban ghi trung
 * (FR-PER-001 "Idempotent; dong bo da thiet bi").
 *
 * accessibility_preferences + deleted_at gan vao iam.users thay vi bang rieng vi day la
 * thuoc tinh 1-1 cua user, cung nhom voi preferred_language/interests da co tu M1.
 * deleted_at danh dau tai khoan da "xoa" theo huong an danh hoa (khong hard-delete) vi nhieu
 * bang khac (contributions, entities, terms...) tham chieu iam.users(id) khong co ON DELETE
 * CASCADE — giu dung nguyen tac "Noi dung giu attribution theo consent hoac chuyen dang an
 * danh theo yeu cau hop le" (SRS muc 7.2, R1).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "experience", name: "saved_items" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      entity_id: { type: "uuid", references: '"heritage"."entities"', onDelete: "CASCADE" },
      term_id: { type: "uuid", references: '"handbook"."terms"', onDelete: "CASCADE" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "experience", name: "saved_items" }, "saved_items_target_check", {
    check:
      "(entity_id IS NOT NULL AND term_id IS NULL) OR (entity_id IS NULL AND term_id IS NOT NULL)",
  });
  pgm.createIndex({ schema: "experience", name: "saved_items" }, "user_id");
  pgm.createIndex({ schema: "experience", name: "saved_items" }, ["user_id", "entity_id"], {
    unique: true,
    where: "entity_id IS NOT NULL",
  });
  pgm.createIndex({ schema: "experience", name: "saved_items" }, ["user_id", "term_id"], {
    unique: true,
    where: "term_id IS NOT NULL",
  });

  pgm.addColumn({ schema: "iam", name: "users" }, {
    accessibility_preferences: { type: "jsonb" },
    deleted_at: { type: "timestamptz" },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn({ schema: "iam", name: "users" }, ["accessibility_preferences", "deleted_at"]);
  pgm.dropTable({ schema: "experience", name: "saved_items" });
};
