/** GĐ2: account preferences, encrypted MFA material and auditable privacy requests. */
exports.up = (pgm) => {
  pgm.addColumns({ schema: "iam", name: "users" }, {
    mfa_secret_encrypted: { type: "text" },
    notification_preferences: { type: "jsonb", notNull: true, default: pgm.func("'{}'::jsonb") },
  });
  pgm.createTable({ schema: "ops", name: "privacy_requests" }, {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
    request_type: { type: "text", notNull: true },
    status: { type: "text", notNull: true, default: "REQUESTED" },
    due_at: { type: "timestamptz", notNull: true },
    completed_at: { type: "timestamptz" },
    failure_reason: { type: "text" },
    result_payload: { type: "jsonb" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint({ schema: "ops", name: "privacy_requests" }, "privacy_requests_type_check", { check: "request_type IN ('EXPORT','DELETE')" });
  pgm.addConstraint({ schema: "ops", name: "privacy_requests" }, "privacy_requests_status_check", { check: "status IN ('REQUESTED','PROCESSING','COMPLETED','REJECTED','FAILED','CANCELLED')" });
  pgm.createIndex({ schema: "ops", name: "privacy_requests" }, ["user_id", "created_at"]);
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: "ops", name: "privacy_requests" });
  pgm.dropColumns({ schema: "iam", name: "users" }, ["notification_preferences", "mfa_secret_encrypted"]);
};
