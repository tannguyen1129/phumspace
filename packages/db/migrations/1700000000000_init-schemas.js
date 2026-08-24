/**
 * Migration khoi tao Milestone M0: bat cac extension can thiet va tao rong 10 schema domain
 * theo docs/PhumSpace_Database_Design_PhumData_Schema (moi module so huu 1 schema rieng
 * trong cung 1 Postgres cluster — modular monolith, chua tach DB o giai doan MVP).
 *
 * Bang/cot cu the cua tung schema se duoc them dan trong cac migration cua M1-M6,
 * gan voi tung milestone (vd iam.* o M1; heritage.* va place.* o M1-M2; scanner.* o M3; ...).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // pgcrypto: dung gen_random_uuid() lam default cho moi primary key (thay uuid-ossp cu hon).
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  // pg_trgm: ho tro trigram search cho ten/thuat ngu da ngon ngu (bao gom tieng Khmer),
  // dung o Handbook/PhumData search truoc khi can toi vector search (DB-DEC-08, hoan lai GD2).
  pgm.createExtension("pg_trgm", { ifNotExists: true });

  // postgis: luu geometry(Point,4326)/geography cho Place — anh docker phai la postgis/postgis.
  pgm.createExtension("postgis", { ifNotExists: true });

  const schemas = [
    "iam", // Identity & Access — user, role, permission, session
    "heritage", // PhumData Catalog — entity, version, source, evidence, relation, taxonomy
    "place", // Map & Discovery — place, opening hours, festival, visitor info, etiquette
    "media", // MediaAsset, rights, consent record, access grant
    "contribution", // Contribution & moderation workflow
    "scanner", // AI Scanner — scan request/job/candidate/result
    "experience", // Personalization — saved items, history, preferences
    "handbook", // Khmer term, pronunciation, deck, learning progress
    "olympiad", // Quiz & competition
    "ops", // Audit log, outbox event, idempotency, notification, analytics, feature flag
  ];

  for (const schema of schemas) {
    pgm.createSchema(schema, { ifNotExists: true });
  }
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  const schemas = [
    "iam",
    "heritage",
    "place",
    "media",
    "contribution",
    "scanner",
    "experience",
    "handbook",
    "olympiad",
    "ops",
  ];

  for (const schema of schemas.reverse()) {
    pgm.dropSchema(schema, { ifExists: true, cascade: true });
  }

  // cascade: true vi anh postgis/postgis tu tao them postgis_topology/postgis_tiger_geocoder
  // phu thuoc vao postgis — drop thuong (khong cascade) se that bai o cac schema tiger/topology.
  pgm.dropExtension("postgis", { ifExists: true, cascade: true });
  pgm.dropExtension("pg_trgm", { ifExists: true });
  pgm.dropExtension("pgcrypto", { ifExists: true });
};
