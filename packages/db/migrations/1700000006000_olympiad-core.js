/**
 * Milestone M4: bang loi cua Digital Culture Olympiad (schema olympiad), rut gon cho MVP —
 * "1 live room demo" nghia la phong thi co room_code + leaderboard qua polling (dung pattern
 * GET lai nhu Scanner), KHONG phai WebSocket gateway realtime (hoan lai GD2 theo OLY-009).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "olympiad", name: "questions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      entity_id: { type: "uuid", references: '"heritage"."entities"' },
      question_text: { type: "text", notNull: true },
      // choices: [{ "id": "a", "text": "..." }, ...] — id noi bo cau hoi, khong phai uuid toan cuc.
      choices: { type: "jsonb", notNull: true },
      correct_choice_id: { type: "text", notNull: true },
      explanation: { type: "text" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "olympiad", name: "questions" }, "entity_id");

  pgm.createTable(
    { schema: "olympiad", name: "competitions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      title: { type: "text", notNull: true },
      status: { type: "text", notNull: true, default: "DRAFT" },
      room_code: { type: "text", notNull: true, unique: true },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "olympiad", name: "competitions" }, "competitions_status_check", {
    check: "status IN ('DRAFT','OPEN','ACTIVE','CLOSED')",
  });

  pgm.createTable(
    { schema: "olympiad", name: "competition_questions" },
    {
      competition_id: {
        type: "uuid",
        notNull: true,
        references: '"olympiad"."competitions"',
        onDelete: "CASCADE",
      },
      question_id: { type: "uuid", notNull: true, references: '"olympiad"."questions"', onDelete: "CASCADE" },
      order_index: { type: "integer", notNull: true },
    }
  );
  pgm.addConstraint(
    { schema: "olympiad", name: "competition_questions" },
    "competition_questions_pkey",
    { primaryKey: ["competition_id", "question_id"] }
  );

  pgm.createTable(
    { schema: "olympiad", name: "competition_participants" },
    {
      competition_id: {
        type: "uuid",
        notNull: true,
        references: '"olympiad"."competitions"',
        onDelete: "CASCADE",
      },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
      joined_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "olympiad", name: "competition_participants" },
    "competition_participants_pkey",
    { primaryKey: ["competition_id", "user_id"] }
  );

  pgm.createTable(
    { schema: "olympiad", name: "submissions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      question_id: { type: "uuid", notNull: true, references: '"olympiad"."questions"' },
      // competition_id NULL = quiz ca nhan (khong gioi han so lan lam lai — xem UNIQUE ben duoi,
      // Postgres coi nhieu NULL la khac nhau nen khong chan retry o che do solo).
      competition_id: { type: "uuid", references: '"olympiad"."competitions"' },
      selected_choice_id: { type: "text", notNull: true },
      is_correct: { type: "boolean", notNull: true },
      submitted_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "olympiad", name: "submissions" }, "submissions_user_question_competition_key", {
    unique: ["user_id", "question_id", "competition_id"],
  });
  pgm.createIndex({ schema: "olympiad", name: "submissions" }, "competition_id");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "olympiad", name: "submissions" });
  pgm.dropTable({ schema: "olympiad", name: "competition_participants" });
  pgm.dropTable({ schema: "olympiad", name: "competition_questions" });
  pgm.dropTable({ schema: "olympiad", name: "competitions" });
  pgm.dropTable({ schema: "olympiad", name: "questions" });
};
