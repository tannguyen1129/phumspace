/** GĐ5: handbook practice/audio provenance and reliable olympiad submissions. */
exports.up = (pgm) => {
  pgm.addColumns({ schema: "handbook", name: "term_audio" }, {
    recorded_at: { type: "date" },
    rights_note: { type: "text" },
    transcript: { type: "text" },
    verification_status: { type: "text", notNull: true, default: "VERIFIED" },
  });
  pgm.addColumns({ schema: "handbook", name: "learning_progress" }, {
    next_review_at: { type: "timestamptz" },
    last_result: { type: "text" },
  });
  pgm.addConstraint({ schema: "handbook", name: "learning_progress" }, "learning_progress_result_check", {
    check: "last_result IS NULL OR last_result IN ('AGAIN','HARD','GOOD')",
  });

  pgm.addColumns({ schema: "olympiad", name: "questions" }, {
    question_type: { type: "text", notNull: true, default: "SINGLE_CHOICE" },
    version: { type: "integer", notNull: true, default: 1 },
    difficulty: { type: "text", notNull: true, default: "MEDIUM" },
    topic: { type: "text" },
    language: { type: "text", notNull: true, default: "vi" },
    time_limit_seconds: { type: "integer" },
    source_note: { type: "text" },
  });
  pgm.addColumns({ schema: "olympiad", name: "submissions" }, {
    idempotency_key: { type: "text" },
    question_version: { type: "integer", notNull: true, default: 1 },
  });
  pgm.createIndex({ schema: "olympiad", name: "submissions" }, ["user_id", "idempotency_key"], {
    unique: true,
    where: "idempotency_key IS NOT NULL",
    name: "submissions_user_idempotency_key_idx",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex({ schema: "olympiad", name: "submissions" }, ["user_id", "idempotency_key"], { name: "submissions_user_idempotency_key_idx" });
  pgm.dropColumns({ schema: "olympiad", name: "submissions" }, ["idempotency_key", "question_version"]);
  pgm.dropColumns({ schema: "olympiad", name: "questions" }, ["question_type", "version", "difficulty", "topic", "language", "time_limit_seconds", "source_note"]);
  pgm.dropConstraint({ schema: "handbook", name: "learning_progress" }, "learning_progress_result_check");
  pgm.dropColumns({ schema: "handbook", name: "learning_progress" }, ["next_review_at", "last_result"]);
  pgm.dropColumns({ schema: "handbook", name: "term_audio" }, ["recorded_at", "rights_note", "transcript", "verification_status"]);
};
