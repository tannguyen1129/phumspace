/** GĐ6: generic drafts, consent evidence, revisions, assignment and takedown workflow. */
exports.up = (pgm) => {
  pgm.dropConstraint({ schema: "contribution", name: "contributions" }, "contributions_status_check");
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_status_check", { check: "status IN ('DRAFT','SUBMITTED','TRIAGE','CHANGES_REQUESTED','EXPERT_REVIEW','RIGHTS_REVIEW','APPROVED','PUBLISHED','REJECTED','WITHDRAWN')" });
  pgm.addColumns({ schema: "contribution", name: "contributions" }, {
    contribution_type: { type: "text", notNull: true, default: "AUDIO" },
    language: { type: "text", notNull: true, default: "km" },
    recorded_at: { type: "timestamptz" },
    recorded_by: { type: "text" },
    context_note: { type: "text" },
    location_note: { type: "text" },
    consent_version: { type: "text", notNull: true, default: "2026-08" },
    consent_confirmed_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    consent_method: { type: "text", notNull: true, default: "CHECKBOX" },
    attribution_role: { type: "text" },
    attribution_community: { type: "text" },
    assigned_reviewer_id: { type: "uuid", references: '"iam"."users"' },
    priority: { type: "text", notNull: true, default: "NORMAL" },
  });
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_type_check", { check: "contribution_type IN ('ENTITY','CORRECTION','AUDIO','IMAGE','VIDEO','STORY','TERM','PLACE','SOURCE')" });
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_priority_check", { check: "priority IN ('NORMAL','HIGH','URGENT')" });

  pgm.createTable({ schema: "contribution", name: "drafts" }, {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    contributor_id: { type: "uuid", notNull: true, references: '"iam"."users"', onDelete: "CASCADE" },
    contribution_type: { type: "text", notNull: true },
    payload: { type: "jsonb", notNull: true, default: "{}" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex({ schema: "contribution", name: "drafts" }, "contributor_id");
  pgm.addConstraint({ schema: "contribution", name: "drafts" }, "drafts_type_check", { check: "contribution_type IN ('ENTITY','CORRECTION','AUDIO','IMAGE','VIDEO','STORY','TERM','PLACE','SOURCE')" });

  pgm.createTable({ schema: "contribution", name: "revisions" }, {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    contribution_id: { type: "uuid", notNull: true, references: '"contribution"."contributions"', onDelete: "CASCADE" },
    revision_number: { type: "integer", notNull: true },
    snapshot: { type: "jsonb", notNull: true },
    changed_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint({ schema: "contribution", name: "revisions" }, "revisions_contribution_number_key", { unique: ["contribution_id", "revision_number"] });

  pgm.createTable({ schema: "contribution", name: "requests" }, {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    contribution_id: { type: "uuid", notNull: true, references: '"contribution"."contributions"' },
    requester_id: { type: "uuid", notNull: true, references: '"iam"."users"' },
    request_type: { type: "text", notNull: true },
    reason: { type: "text", notNull: true },
    status: { type: "text", notNull: true, default: "OPEN" },
    priority: { type: "text", notNull: true, default: "HIGH" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};
exports.down = (pgm) => {
  pgm.dropTable({ schema: "contribution", name: "requests" });
  pgm.dropTable({ schema: "contribution", name: "revisions" });
  pgm.dropTable({ schema: "contribution", name: "drafts" });
  pgm.dropConstraint({ schema: "contribution", name: "contributions" }, "contributions_priority_check");
  pgm.dropConstraint({ schema: "contribution", name: "contributions" }, "contributions_type_check");
  pgm.dropConstraint({ schema: "contribution", name: "contributions" }, "contributions_status_check");
  pgm.addConstraint({ schema: "contribution", name: "contributions" }, "contributions_status_check", { check: "status IN ('SUBMITTED','APPROVED','PUBLISHED','REJECTED','CHANGES_REQUESTED','WITHDRAWN')" });
  pgm.dropColumns({ schema: "contribution", name: "contributions" }, ["contribution_type","language","recorded_at","recorded_by","context_note","location_note","consent_version","consent_confirmed_at","consent_method","attribution_role","attribution_community","assigned_reviewer_id","priority"]);
};
