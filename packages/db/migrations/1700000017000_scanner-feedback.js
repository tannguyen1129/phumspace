/** GĐ4: feedback của người dùng tách khỏi PhumData, không tự sửa nội dung xuất bản. */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "scanner", name: "scan_feedback" },
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      scan_request_id: {
        type: "uuid",
        notNull: true,
        references: '"scanner"."scan_requests"',
        onDelete: "CASCADE",
      },
      user_id: {
        type: "uuid",
        notNull: true,
        references: '"iam"."users"',
        onDelete: "CASCADE",
      },
      feedback_type: { type: "text", notNull: true },
      selected_entity_id: { type: "uuid", references: '"heritage"."entities"' },
      note: { type: "text" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    },
  );
  pgm.addConstraint(
    { schema: "scanner", name: "scan_feedback" },
    "scan_feedback_type_check",
    {
      check:
        "feedback_type IN ('CORRECT','INCORRECT','UNSURE','SELECTED_CANDIDATE','REQUEST_REVIEW')",
    },
  );
  pgm.createIndex({ schema: "scanner", name: "scan_feedback" }, [
    "scan_request_id",
    "user_id",
  ]);
};
exports.down = (pgm) =>
  pgm.dropTable({ schema: "scanner", name: "scan_feedback" });
