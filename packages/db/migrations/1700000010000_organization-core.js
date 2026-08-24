/**
 * Milestone M8: dong no ky thuat R1 (FR-ORG-003/004, MUST/R1, phat hien khi len ke hoach GD2) —
 * "To chuc phai co the quan ly event/competition va xem bao cao cua rieng minh... R1 cho phep
 * mot organization demo." Chua lam FR-ORG-001/002/005/006 (SHOULD/R2: System Admin duyet don,
 * Manager tu moi thanh vien, branding, export co audit) — hoan lai Phase B GD2 de giu dung scope.
 *
 * organization_id tren olympiad.competitions de nullable — khong pha vo competition demo da
 * seed tu M4 (competition do khong thuoc to chuc nao cho toi khi duoc gan lai o seed script).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "iam", name: "organizations" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      name: { type: "text", notNull: true },
      org_type: { type: "text", notNull: true },
      status: { type: "text", notNull: true, default: "ACTIVE" },
      // Chua/truong/bao tang co the gan voi 1 dia diem da co trong PhumData (khong bat buoc).
      home_place_id: { type: "uuid", references: '"heritage"."entities"' },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "iam", name: "organizations" }, "organizations_org_type_check", {
    check: "org_type IN ('PAGODA','SCHOOL','CLUB','MUSEUM','AGENCY','PROJECT_TEAM')",
  });
  pgm.addConstraint({ schema: "iam", name: "organizations" }, "organizations_status_check", {
    check: "status IN ('ACTIVE','SUSPENDED')",
  });

  pgm.createTable(
    { schema: "iam", name: "organization_memberships" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      organization_id: {
        type: "uuid",
        notNull: true,
        references: '"iam"."organizations"',
        onDelete: "CASCADE",
      },
      user_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
      role: { type: "text", notNull: true, default: "MEMBER" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "iam", name: "organization_memberships" },
    "organization_memberships_role_check",
    { check: "role IN ('MANAGER','MEMBER')" }
  );
  pgm.addConstraint(
    { schema: "iam", name: "organization_memberships" },
    "organization_memberships_unique",
    { unique: ["organization_id", "user_id"] }
  );

  pgm.addColumn(
    { schema: "olympiad", name: "competitions" },
    { organization_id: { type: "uuid", references: '"iam"."organizations"' } }
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn({ schema: "olympiad", name: "competitions" }, "organization_id");
  pgm.dropTable({ schema: "iam", name: "organization_memberships" });
  pgm.dropTable({ schema: "iam", name: "organizations" });
};
