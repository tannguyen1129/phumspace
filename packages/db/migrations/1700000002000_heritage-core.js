/**
 * Milestone M1: bang loi cua PhumData Catalog (schema heritage) — subset toi thieu de
 * chung minh mo hinh entity/version/taxonomy/relation/source. Cac bang giau hon
 * (evidence_assertion, verification_review, publication_event...) se them o Milestone M5
 * khi trien khai Moderation & Publication day du — xem plan.md muc 2.4.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "heritage", name: "entities" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      canonical_code: { type: "text", notNull: true, unique: true },
      entity_type: { type: "text", notNull: true },
      access_level: { type: "text", notNull: true, default: "PUBLIC" },
      // FK toi entity_versions duoc them sau (ALTER TABLE) vi entity_versions can entities
      // ton tai truoc — tranh phu thuoc vong giua hai bang.
      current_version_id: { type: "uuid" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "heritage", name: "entities" }, "entities_entity_type_check", {
    check:
      "entity_type IN ('PLACE','TANGIBLE_HERITAGE','INTANGIBLE_HERITAGE','TERM','PERSON','ORGANIZATION','EVENT','MEDIA','SOURCE')",
  });
  pgm.addConstraint({ schema: "heritage", name: "entities" }, "entities_access_level_check", {
    check: "access_level IN ('PUBLIC','EDUCATIONAL','RESEARCH','COMMUNITY_ONLY','RESTRICTED')",
  });
  pgm.createIndex({ schema: "heritage", name: "entities" }, "entity_type");

  pgm.createTable(
    { schema: "heritage", name: "entity_versions" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      entity_id: { type: "uuid", notNull: true, references: '"heritage"."entities"', onDelete: "CASCADE" },
      version_no: { type: "integer", notNull: true },
      publication_status: { type: "text", notNull: true, default: "DRAFT" },
      verification_level: { type: "text", notNull: true, default: "UNVERIFIED" },
      sensitivity_level: { type: "text", notNull: true, default: "PUBLIC" },
      preferred_label: { type: "text", notNull: true },
      description: { type: "text" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint(
    { schema: "heritage", name: "entity_versions" },
    "entity_versions_entity_id_version_no_key",
    { unique: ["entity_id", "version_no"] }
  );
  pgm.addConstraint(
    { schema: "heritage", name: "entity_versions" },
    "entity_versions_publication_status_check",
    { check: "publication_status IN ('DRAFT','IN_REVIEW','APPROVED','PUBLISHED','SUPERSEDED','WITHDRAWN')" }
  );
  pgm.addConstraint(
    { schema: "heritage", name: "entity_versions" },
    "entity_versions_verification_level_check",
    { check: "verification_level IN ('UNVERIFIED','COMMUNITY_CONFIRMED','SOURCE_VERIFIED','EXPERT_REVIEWED')" }
  );
  pgm.addConstraint(
    { schema: "heritage", name: "entity_versions" },
    "entity_versions_sensitivity_level_check",
    { check: "sensitivity_level IN ('PUBLIC','CONTEXTUAL','COMMUNITY_ONLY','RESTRICTED')" }
  );
  pgm.createIndex({ schema: "heritage", name: "entity_versions" }, "entity_id");
  // Trigram search cho ten thuc the (ho tro tim kiem gan dung, ke ca chu Khmer) — dung
  // pg_trgm da bat o migration init-schemas thay vi cho vector search (hoan lai GD2, DB-DEC-08).
  pgm.sql(
    `CREATE INDEX entity_versions_preferred_label_trgm_idx ON heritage.entity_versions USING gin (preferred_label gin_trgm_ops)`
  );

  pgm.addConstraint({ schema: "heritage", name: "entities" }, "entities_current_version_id_fkey", {
    foreignKeys: {
      columns: "current_version_id",
      references: '"heritage"."entity_versions"',
      onDelete: "SET NULL",
    },
  });

  pgm.createTable(
    { schema: "heritage", name: "taxonomy_terms" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      scheme: { type: "text", notNull: true },
      code: { type: "text", notNull: true },
      label: { type: "text", notNull: true },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "heritage", name: "taxonomy_terms" }, "taxonomy_terms_scheme_code_key", {
    unique: ["scheme", "code"],
  });

  pgm.createTable(
    { schema: "heritage", name: "entity_categories" },
    {
      entity_id: { type: "uuid", notNull: true, references: '"heritage"."entities"', onDelete: "CASCADE" },
      term_id: { type: "uuid", notNull: true, references: '"heritage"."taxonomy_terms"', onDelete: "CASCADE" },
    }
  );
  pgm.addConstraint({ schema: "heritage", name: "entity_categories" }, "entity_categories_pkey", {
    primaryKey: ["entity_id", "term_id"],
  });

  pgm.createTable(
    { schema: "heritage", name: "relations" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      subject_entity_id: {
        type: "uuid",
        notNull: true,
        references: '"heritage"."entities"',
        onDelete: "CASCADE",
      },
      predicate: { type: "text", notNull: true },
      object_entity_id: {
        type: "uuid",
        notNull: true,
        references: '"heritage"."entities"',
        onDelete: "CASCADE",
      },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "heritage", name: "relations" }, "relations_predicate_check", {
    check:
      "predicate IN ('LOCATED_AT','PART_OF','PRACTICED_BY','PERFORMED_AT','RELATED_TERM','DEPICTED_IN','VERIFIED_BY','DERIVED_FROM')",
  });
  pgm.createIndex({ schema: "heritage", name: "relations" }, "subject_entity_id");
  pgm.createIndex({ schema: "heritage", name: "relations" }, "object_entity_id");

  pgm.createTable(
    { schema: "heritage", name: "sources" },
    {
      id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
      title: { type: "text", notNull: true },
      author: { type: "text" },
      url: { type: "text" },
      reliability: { type: "text" },
      created_by: { type: "uuid", notNull: true, references: '"iam"."users"' },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "heritage", name: "sources" });
  pgm.dropTable({ schema: "heritage", name: "relations" });
  pgm.dropTable({ schema: "heritage", name: "entity_categories" });
  pgm.dropTable({ schema: "heritage", name: "taxonomy_terms" });
  pgm.dropConstraint({ schema: "heritage", name: "entities" }, "entities_current_version_id_fkey");
  pgm.dropTable({ schema: "heritage", name: "entity_versions" });
  pgm.dropTable({ schema: "heritage", name: "entities" });
};
