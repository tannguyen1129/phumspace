/**
 * Milestone M4: bang loi cua Interactive Khmer Handbook (schema handbook).
 * terms co the lien ket toi mot heritage.entities (vd tu gan voi mot le hoi/dia diem) —
 * nullable vi khong phai tu vung nao cung gan voi 1 thuc the cu the.
 * Deck/DeckItem va spaced-repetition duoc hoan lai GD2 (R2) de giu M4 dung scope.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "handbook", name: "terms" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      khmer_text: { type: "text", notNull: true },
      latin_transliteration: { type: "text" },
      meaning_vi: { type: "text", notNull: true },
      meaning_en: { type: "text" },
      entity_id: { type: "uuid", references: '"heritage"."entities"' },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "handbook", name: "terms" }, "entity_id");
  pgm.sql(
    `CREATE INDEX terms_khmer_text_trgm_idx ON handbook.terms USING gin (khmer_text gin_trgm_ops)`
  );

  pgm.createTable(
    { schema: "handbook", name: "term_examples" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      term_id: { type: "uuid", notNull: true, references: '"handbook"."terms"', onDelete: "CASCADE" },
      example_khmer: { type: "text", notNull: true },
      example_vi: { type: "text", notNull: true },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "handbook", name: "term_examples" }, "term_id");

  pgm.createTable(
    { schema: "handbook", name: "term_audio" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      term_id: { type: "uuid", notNull: true, references: '"handbook"."terms"', onDelete: "CASCADE" },
      media_key: { type: "text", notNull: true },
      speaker_name: { type: "text" },
      region: { type: "text" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "handbook", name: "term_audio" }, "term_id");

  pgm.createTable(
    { schema: "handbook", name: "learning_progress" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      term_id: { type: "uuid", notNull: true, references: '"handbook"."terms"', onDelete: "CASCADE" },
      status: { type: "text", notNull: true, default: "NEW" },
      review_count: { type: "integer", notNull: true, default: 0 },
      last_reviewed_at: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "handbook", name: "learning_progress" }, "learning_progress_status_check", {
    check: "status IN ('NEW','LEARNING','LEARNED')",
  });
  pgm.addConstraint({ schema: "handbook", name: "learning_progress" }, "learning_progress_user_term_key", {
    unique: ["user_id", "term_id"],
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "handbook", name: "learning_progress" });
  pgm.dropTable({ schema: "handbook", name: "term_audio" });
  pgm.dropTable({ schema: "handbook", name: "term_examples" });
  pgm.dropTable({ schema: "handbook", name: "terms" });
};
