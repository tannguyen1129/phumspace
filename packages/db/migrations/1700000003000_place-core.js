/**
 * Milestone M2: bang loi cua Map & Discovery (schema place) — Place duoc mo hinh nhu
 * mot lop du lieu dia ly gan voi heritage.entities (entityType='PLACE'), tai su dung
 * provenance/version/publication cua PhumData thay vi trung lap (dung theo dinh huong
 * DB Design "place co the dong thoi la heritage_entity de dung chung content/provenance").
 *
 * heritage.version_sources la lien ket "nguon" toi thieu cho tung entity_version — ban
 * day du hon (evidence_assertion tung claim) se den o Milestone M5 (Moderation).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(
    { schema: "place", name: "places" },
    {
      entity_id: {
        type: "uuid",
        primaryKey: true,
        references: '"heritage"."entities"',
        onDelete: "CASCADE",
      },
      place_type: { type: "text", notNull: true },
      local_name: { type: "text" },
      location: { type: "geography(Point,4326)", notNull: true },
      visitor_summary: { type: "text" },
      opening_hours_note: { type: "text" },
      etiquette_note: { type: "text" },
      administrative_area: { type: "text", notNull: true, default: "Trà Vinh" },
      last_verified_at: { type: "timestamptz" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    }
  );
  pgm.addConstraint({ schema: "place", name: "places" }, "places_place_type_check", {
    check:
      "place_type IN ('PAGODA','MUSEUM','LAKE','MARKET','CRAFT_VILLAGE','FESTIVAL_GROUND','RESTAURANT','OTHER')",
  });
  // GIST index bat buoc de ST_DWithin/ST_Distance (Nearby Discovery, MAP-005) chay hieu qua.
  pgm.sql(`CREATE INDEX places_location_gix ON place.places USING GIST (location)`);

  pgm.createTable(
    { schema: "heritage", name: "version_sources" },
    {
      entity_version_id: {
        type: "uuid",
        notNull: true,
        references: '"heritage"."entity_versions"',
        onDelete: "CASCADE",
      },
      source_id: { type: "uuid", notNull: true, references: '"heritage"."sources"', onDelete: "CASCADE" },
    }
  );
  pgm.addConstraint({ schema: "heritage", name: "version_sources" }, "version_sources_pkey", {
    primaryKey: ["entity_version_id", "source_id"],
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable({ schema: "heritage", name: "version_sources" });
  pgm.dropTable({ schema: "place", name: "places" });
};
