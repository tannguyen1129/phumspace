/** Password reset tokens are single-use, short-lived and stored only as hashes. */
exports.up = (pgm) => {
  pgm.createTable({ schema: "iam", name: "password_reset_tokens" }, {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
    token_hash: { type: "text", notNull: true, unique: true },
    expires_at: { type: "timestamptz", notNull: true },
    consumed_at: { type: "timestamptz" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex({ schema: "iam", name: "password_reset_tokens" }, "user_id");
};

exports.down = (pgm) => pgm.dropTable({ schema: "iam", name: "password_reset_tokens" });
