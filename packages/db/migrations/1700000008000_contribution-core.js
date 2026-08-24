/**
 * Milestone M5: Contribution & Moderation — "khep vong du lieu" (docs muc 5.2, 17.2):
 * cong dong dong gop -> kiem duyet -> xuat ban -> xuat hien lai trong Handbook.
 *
 * O M5, loai dong gop duy nhat la audio cho mot tu vung Handbook (co the la tu da co, hoac
 * de xuat tu moi qua proposed_khmer_text) — cac loai dong gop khac (story, correction...)
 * hoan lai GD2 de giu scope dung (xem plan.md muc 2.6, rui ro R4).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "contribution", name: "contributions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      contributor_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      // term_id != null: dong gop audio cho tu da co. term_id == null: de xuat tu moi
      // (proposed_khmer_text bat buoc trong truong hop nay — xem CHECK ben duoi).
      term_id: { type: "uuid", references: '"handbook"."terms"' },
      proposed_khmer_text: { type: "text" },
      proposed_latin_transliteration: { type: "text" },
      proposed_meaning_vi: { type: "text" },
      media_key: { type: "text", notNull: true },
      region: { type: "text" },
      consent_scope: { type: "text", notNull: true },
      ai_permission: { type: "text", notNull: true, default: "RAG_ALLOWED" },
      // null = an danh (docs muc 6.5 "Attribution: ten hien thi hoac yeu cau an danh").
      attribution_name: { type: "text" },
      sensitive: { type: "boolean", notNull: true, default: false },
      status: { type: "text", notNull: true, default: "SUBMITTED" },
      result_term_id: { type: "uuid", references: '"handbook"."terms"' },
      result_audio_id: { type: "uuid", references: '"handbook"."term_audio"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_status_check", {
    check: "status IN ('SUBMITTED','APPROVED','PUBLISHED','REJECTED','CHANGES_REQUESTED','WITHDRAWN')",
  });
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_consent_scope_check", {
    check: "consent_scope IN ('PUBLIC','EDUCATIONAL','RESEARCH','COMMUNITY_ONLY','INTERNAL')",
  });
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_ai_permission_check", {
    check: "ai_permission IN ('RAG_ALLOWED','EVALUATION_ONLY','TRAINING_ALLOWED','AI_NOT_ALLOWED')",
  });
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_target_check", {
    check: "term_id IS NOT NULL OR proposed_khmer_text IS NOT NULL",
  });
  pgm.createIndex({ schema: "contribution", name: "contributions" }, "contributor_id");
  pgm.createIndex({ schema: "contribution", name: "contributions" }, "status");

  pgm.createTable(
    { schema: "contribution", name: "moderation_decisions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      contribution_id: {
        type: "uuid",
        notNull: true,
        references: '"contribution"."contributions"',
        onDelete: "CASCADE",
      },
      reviewer_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      decision: { type: "text", notNull: true },
      reason: { type: "text" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "contribution", name: "moderation_decisions" },
    "moderation_decisions_decision_check",
    { check: "decision IN ('APPROVED','REJECTED','CHANGES_REQUESTED')" }
  );
  pgm.createIndex({ schema: "contribution", name: "moderation_decisions" }, "contribution_id");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "contribution", name: "moderation_decisions" });
  pgm.dropTable({ schema: "contribution", name: "contributions" });
};
