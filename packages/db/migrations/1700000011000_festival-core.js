/**
 * Milestone M8: dong no ky thuat R1 (FR-FES-001/007, MUST/R1) — "He thong phai co trang le hoi
 * voi mo ta, dia diem, thoi gian, chuong trinh... Hien thi mot le hoi mau tu PhumData" va
 * "Noi dung luat thi dau va kien thuc the thao phai lien ket nguon va quiz lien quan... Mot bo
 * noi dung dua ghe Ngo mau co nguon."
 *
 * Le hoi CUNG LA 1 heritage entity (entity_type='EVENT') de dung chung noi dung/nguon/publication
 * status voi phan con lai cua PhumData — dung pattern place.places -> heritage.entities da dung
 * tu M2 (khong tao rieng 1 he thong publication cho Festival).
 *
 * place.boat_teams (ho so doi ghe Ngo, FR-FES-004) hoan lai Phase B GD2 — SHOULD/R2, khong phai
 * MUST/R1; FR-FES-007 chi doi hoi NOI DUNG dua ghe Ngo co nguon, khong doi hoi ho so doi that.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "place", name: "festivals" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      entity_id: {
        type: "uuid",
        notNull: true,
        references: '"heritage"."entities"',
        onDelete: "CASCADE",
      },
      // Chu ky lap lai o dang tu do (vd "hang nam, thang 10-11 am lich") — khong ep thanh cron
      // expression vi day la lich am/theo mua, khong phai lich co dinh.
      recurrence_rule: { type: "text" },
      organizer_org_id: { type: "uuid", references: '"iam"."organizations"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "place", name: "festivals" }, "entity_id", { unique: true });

  pgm.createTable(
    { schema: "place", name: "festival_occurrences" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      festival_id: {
        type: "uuid",
        notNull: true,
        references: '"place"."festivals"',
        onDelete: "CASCADE",
      },
      place_id: { type: "uuid", references: '"heritage"."entities"' },
      starts_at: { type: "timestamptz", notNull: true },
      ends_at: { type: "timestamptz" },
      status: { type: "text", notNull: true, default: "PLANNED" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "place", name: "festival_occurrences" },
    "festival_occurrences_status_check",
    { check: "status IN ('PLANNED','CONFIRMED','POSTPONED','CANCELLED')" }
  );
  pgm.createIndex({ schema: "place", name: "festival_occurrences" }, "festival_id");

  pgm.createTable(
    { schema: "place", name: "festival_events" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      occurrence_id: {
        type: "uuid",
        notNull: true,
        references: '"place"."festival_occurrences"',
        onDelete: "CASCADE",
      },
      event_type: { type: "text", notNull: true },
      title: { type: "text", notNull: true },
      scheduled_at: { type: "timestamptz" },
      note: { type: "text" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.createIndex({ schema: "place", name: "festival_events" }, "occurrence_id");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "place", name: "festival_events" });
  pgm.dropTable({ schema: "place", name: "festival_occurrences" });
  pgm.dropTable({ schema: "place", name: "festivals" });
};
