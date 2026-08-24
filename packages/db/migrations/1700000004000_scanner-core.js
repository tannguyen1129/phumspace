/**
 * Milestone M3: bang loi cua AI Cultural Scanner (schema scanner).
 * scan_requests theo doi vong doi tu luc nhan anh den luc worker xu ly xong qua queue "ai-scan";
 * scan_results luu quyet dinh cuoi cung cua Decision Engine (1-1 voi scan_requests khi da xong).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "scanner", name: "scan_requests" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      media_key: { type: "text", notNull: true },
      mime_type: { type: "text", notNull: true },
      place_id: { type: "uuid", references: '"heritage"."entities"' },
      status: { type: "text", notNull: true, default: "PENDING" },
      error_message: { type: "text" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "scanner", name: "scan_requests" }, "scan_requests_status_check", {
    check: "status IN ('PENDING','PROCESSING','COMPLETED','FAILED')",
  });
  pgm.createIndex({ schema: "scanner", name: "scan_requests" }, "user_id");

  pgm.createTable(
    { schema: "scanner", name: "scan_results" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      scan_request_id: {
        type: "uuid",
        notNull: true,
        unique: true,
        references: '"scanner"."scan_requests"',
        onDelete: "CASCADE",
      },
      decision: { type: "text", notNull: true },
      confidence: { type: "real", notNull: true },
      entity_id: { type: "uuid", references: '"heritage"."entities"' },
      alternative_entity_ids: { type: "uuid[]" },
      synthesis: { type: "jsonb", notNull: true },
      requires_human_review: { type: "boolean", notNull: true, default: true },
      citation_coverage_complete: { type: "boolean", notNull: true, default: false },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "scanner", name: "scan_results" }, "scan_results_decision_check", {
    check: "decision IN ('MATCH','SUGGEST','UNKNOWN','HUMAN_REVIEW')",
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "scanner", name: "scan_results" });
  pgm.dropTable({ schema: "scanner", name: "scan_requests" });
};
