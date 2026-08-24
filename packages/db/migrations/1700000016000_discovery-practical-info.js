/** GĐ3: dữ liệu thực tế có thể xác minh cho Heritage Map và Place Detail. */
exports.up = (pgm) => {
  pgm.createExtension("unaccent", { ifNotExists: true });
  pgm.addColumns(
    { schema: "place", name: "places" },
    {
      address: { type: "text" },
      contact_note: { type: "text" },
      photo_guidance_note: { type: "text" },
      accessibility_note: { type: "text" },
      facilities: { type: "text[]", notNull: true, default: "{}" },
      visit_status: { type: "text", notNull: true, default: "UNKNOWN" },
      suggested_visit_minutes: { type: "integer" },
    },
  );
  pgm.addConstraint(
    { schema: "place", name: "places" },
    "places_visit_status_check",
    {
      check: "visit_status IN ('OPEN','CLOSED','TEMPORARILY_CLOSED','UNKNOWN')",
    },
  );
  pgm.addConstraint(
    { schema: "place", name: "places" },
    "places_visit_minutes_check",
    {
      check:
        "suggested_visit_minutes IS NULL OR suggested_visit_minutes BETWEEN 10 AND 720",
    },
  );
  pgm.sql(`
    UPDATE place.places SET
      address = COALESCE(address, administrative_area),
      facilities = CASE place_type
        WHEN 'PAGODA' THEN ARRAY['PARKING']::text[]
        WHEN 'MUSEUM' THEN ARRAY['PARKING','RESTROOM']::text[]
        WHEN 'LAKE' THEN ARRAY['PARKING','RESTROOM']::text[]
        ELSE ARRAY[]::text[] END,
      suggested_visit_minutes = CASE place_type
        WHEN 'MUSEUM' THEN 90 WHEN 'PAGODA' THEN 60 ELSE 45 END,
      visit_status = 'UNKNOWN'
  `);
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    { schema: "place", name: "places" },
    "places_visit_minutes_check",
  );
  pgm.dropConstraint(
    { schema: "place", name: "places" },
    "places_visit_status_check",
  );
  pgm.dropColumns({ schema: "place", name: "places" }, [
    "address",
    "contact_note",
    "photo_guidance_note",
    "accessibility_note",
    "facilities",
    "visit_status",
    "suggested_visit_minutes",
  ]);
  pgm.dropExtension("unaccent", { ifExists: true });
};
