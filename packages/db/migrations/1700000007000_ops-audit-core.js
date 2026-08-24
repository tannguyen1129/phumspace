/**
 * Milestone M5: audit log bat bien (schema ops) — dung chung cho moi module can ghi vet
 * hanh dong nhay cam (System Design "ops: audit_event, outbox_event, idempotency_record...").
 * O M5 chi Contribution/Moderation ghi vao day; khong co endpoint UPDATE/DELETE o tang API,
 * "bat bien" duoc dam bao boi thiet ke ung dung chu khong phai rang buoc DB (chap nhan duoc o MVP).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "ops", name: "audit_events" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      actor_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      action: { type: "text", notNull: true },
      target_type: { type: "text", notNull: true },
      target_id: { type: "uuid", notNull: true },
      metadata: { type: "jsonb" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "ops", name: "audit_events" }, ["target_type", "target_id"]);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "ops", name: "audit_events" });
};
