/**
 * Seed du lieu dev/demo cho GD1-MVP + Milestone M8 (dong no ky thuat R1 cho GD2):
 *  - M1: controlled vocabulary (taxonomy "topic") + 1 tai khoan SYSTEM_ADMIN.
 *  - M2: 3 dia diem pilot tai Tra Vinh (cum Chua Ang – Ao Ba Om – Bao tang Van hoa dan toc
 *    Khmer, dung theo docs/PhumSpace_Tai_lieu_mo_ta_chi_tiet_du_an muc 8.1 va Phu luc E) —
 *    publish thang (khong qua DRAFT) vi day la du lieu da duoc "duyet truoc" cho demo.
 *  - M8: 1 to chuc demo (FR-ORG-003), 1 le hoi Ok Om Bok + noi dung Dua ghe Ngo co nguon that
 *    tu chinh tai lieu goc (FR-FES-001/007).
 * Idempotent — chay lai nhieu lan khong tao du lieu trung (kiem tra ton tai truoc khi insert).
 */
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import * as bcrypt from "bcryptjs";
import { Pool, type PoolClient } from "pg";

loadDotenv({ path: resolve(__dirname, "../../../.env") });

const SALT_ROUNDS = 12;

/** scheme "topic" — chu de kham pha dung o Map/Discover filter (UX Flow "Discovery Map"). */
const TOPIC_TERMS: Array<{ code: string; label: string }> = [
  { code: "chua", label: "Chùa" },
  { code: "le-hoi", label: "Lễ hội" },
  { code: "am-nhac", label: "Âm nhạc" },
  { code: "nghe-thuat-trinh-dien", label: "Nghệ thuật trình diễn" },
  { code: "am-thuc", label: "Ẩm thực" },
  { code: "lang-nghe", label: "Làng nghề" },
  { code: "ngon-ngu", label: "Ngôn ngữ" },
  { code: "bao-tang", label: "Bảo tàng" },
];

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@phumspace.dev";
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
const SEED_ADMIN_NAME = "PhumSpace Admin (dev seed)";

/**
 * Nguon: https://dantoc.vietnamtourism.gov.vn/chua-ang-ngoi-co-tu-khmer-tuyet-dep-o-vinh-long/
 * (Cuc Du lich Quoc gia Viet Nam) — bai viet mo ta ca cum Chua Ang – Ao Ba Om – Bao tang, nen
 * dung chung 1 source cho ca 3 dia diem thay vi bia them nguon rieng khong co that.
 */
const CLUSTER_SOURCE = {
  title: "Cục Du lịch Quốc gia Việt Nam – Chùa Âng, ngôi cổ tự Khmer tuyệt đẹp",
  author: "Cục Du lịch Quốc gia Việt Nam",
  url: "https://dantoc.vietnamtourism.gov.vn/chua-ang-ngoi-co-tu-khmer-tuyet-dep-o-vinh-long/",
  reliability: "OFFICIAL",
};

/**
 * Nguon cho Le hoi Ok Om Bok + Dua ghe Ngo (Milestone M8, dong no FR-FES-001/007) — dung 2 nguon
 * chinh thong da duoc trich dan san trong chinh tai lieu goc (muc "NGUON NGHIEN CUU BO SUNG CHO
 * V1.1"), khong bia them nguon rieng cho dua ghe Ngo vi ca 2 nguon nay deu mo ta hoat dong dua
 * ghe la mot phan cua le hoi Ok Om Bok.
 */
const OK_OM_BOK_SOURCE = {
  title: "Cục Du lịch Quốc gia Việt Nam – Lễ hội Ok Om Bok",
  author: "Cục Du lịch Quốc gia Việt Nam",
  url: "https://vietnamtourism.gov.vn/post/15419",
  reliability: "OFFICIAL",
};

const HERITAGE_REGISTRY_SOURCE = {
  title: "Cục Di sản văn hóa – Danh mục Di sản văn hóa phi vật thể quốc gia",
  author: "Cục Di sản văn hóa",
  url: "https://dsvh.gov.vn/danh-muc-di-san-van-hoa-phi-vat-the-quoc-gia-1789",
  reliability: "OFFICIAL",
};

/**
 * Nguon rieng cho Chua Ong Met (Milestone M11, GD2 "mo rong du lieu that") — tim moi qua
 * WebSearch/WebFetch, doc lap voi CLUSTER_SOURCE (bai ve cum Chua Ang). Bai viet xac nhan: xay
 * nam 642, tai Phuong 1 TP. Tra Vinh, trung tu gan nhat 2022 (hon 23 ty dong).
 */
const ONG_MET_SOURCE = {
  title: "Cục Du lịch Quốc gia Việt Nam – Bảo tồn, phát huy bản sắc văn hóa dân tộc Khmer Trà Vinh",
  author: "Cục Du lịch Quốc gia Việt Nam",
  url: "https://dantoc.vietnamtourism.gov.vn/bao-ton-phat-huy-ban-sac-van-hoa-dan-toc-khmer-tra-vinh/",
  reliability: "OFFICIAL",
};

interface PlaceSeed {
  canonicalCode: string;
  placeType: string;
  preferredLabel: string;
  localName: string;
  description: string;
  visitorSummary: string;
  etiquetteNote: string;
  latitude: number;
  longitude: number;
  topicCode: string;
}

/** Toa do gan dung cum Chua Ang – Ao Ba Om – Bao tang tai TP. Tra Vinh (chi dung hien thi ban do o M2). */
const PLACES: PlaceSeed[] = [
  {
    canonicalCode: "PLACE-CHUA-ANG",
    placeType: "PAGODA",
    preferredLabel: "Chùa Âng",
    localName: "Wat Angkorajaborey",
    description:
      "Ngôi chùa Khmer cổ tại Trà Vinh, nằm trong cụm di tích Ao Bà Om – Bảo tàng Văn hóa dân tộc Khmer, kiến trúc Phật giáo Nam tông Khmer tiêu biểu.",
    visitorSummary: "Chùa cổ Khmer với kiến trúc đặc trưng, điểm khởi đầu để tìm hiểu Phật giáo Nam tông Khmer tại Trà Vinh.",
    etiquetteNote: "Ăn mặc kín đáo, giữ yên lặng trong khuôn viên chùa, xin phép trước khi chụp ảnh sư sãi hoặc nghi lễ.",
    latitude: 9.9484,
    longitude: 106.3373,
    topicCode: "chua",
  },
  {
    canonicalCode: "PLACE-AO-BA-OM",
    placeType: "LAKE",
    preferredLabel: "Ao Bà Om",
    localName: "Ao Bà Om",
    description:
      "Danh thắng gắn liền với đời sống cộng đồng Khmer Trà Vinh, nằm liền kề Chùa Âng và Bảo tàng Văn hóa dân tộc Khmer, thường gắn với sinh hoạt lễ hội địa phương.",
    visitorSummary: "Hồ nước cổ giữa rừng cây cổ thụ, gắn với truyền thuyết và sinh hoạt cộng đồng Khmer địa phương.",
    etiquetteNote: "Giữ gìn vệ sinh chung, không xả rác quanh hồ, tôn trọng không gian sinh hoạt cộng đồng.",
    latitude: 9.9486,
    longitude: 106.3372,
    topicCode: "le-hoi",
  },
  {
    canonicalCode: "PLACE-BAO-TANG-KHMER",
    placeType: "MUSEUM",
    preferredLabel: "Bảo tàng Văn hóa dân tộc Khmer",
    localName: "Bảo tàng Văn hóa dân tộc Khmer tỉnh Trà Vinh",
    description:
      "Bảo tàng trưng bày hiện vật, trang phục, nhạc cụ và tư liệu về đời sống văn hóa Khmer Nam Bộ, nằm trong cụm di tích cùng Chùa Âng và Ao Bà Om.",
    visitorSummary: "Nơi tìm hiểu có hệ thống về hiện vật, trang phục, nhạc cụ và đời sống văn hóa Khmer Nam Bộ.",
    etiquetteNote: "Không chạm vào hiện vật trưng bày, tuân theo hướng dẫn của nhân viên bảo tàng.",
    latitude: 9.949,
    longitude: 106.3376,
    topicCode: "bao-tang",
  },
];

/**
 * Milestone M11 (GD2, "mo rong du lieu that"): dia diem thu 4, doc lap voi cum Chua Ang — dung
 * nguon rieng ONG_MET_SOURCE (khong dung chung CLUSTER_SOURCE). Toa do la uoc luong khu vuc
 * Phuong 1, TP. Tra Vinh (bai viet nguon KHONG cho toa do cu the) — chi dung hien thi ban do,
 * giong dung nguyen tac da ap dung cho 3 dia diem dau (xem chu thich PLACES o tren).
 */
const ONG_MET_PLACE: PlaceSeed = {
  canonicalCode: "PLACE-CHUA-ONG-MET",
  placeType: "PAGODA",
  preferredLabel: "Chùa Ông Mẹt (Kompong)",
  localName: "Wat Kompong",
  description:
    "Ngôi chùa Khmer cổ xây dựng năm 642 tại Phường 1, thành phố Trà Vinh — đại diện cho kiến " +
    "trúc chùa Phật giáo Nam tông Khmer, bảo tồn bản sắc nghệ thuật kiến trúc cổ xưa của người " +
    "Khmer Nam Bộ. Được trùng tu gần nhất năm 2022 với hơn 23 tỷ đồng đầu tư từ tỉnh.",
  visitorSummary: "Một trong những ngôi chùa Khmer lâu đời nhất Trà Vinh, nằm ngay trung tâm thành phố.",
  etiquetteNote: "Ăn mặc kín đáo, giữ yên lặng trong khuôn viên chùa, xin phép trước khi chụp ảnh sư sãi hoặc nghi lễ.",
  latitude: 9.9347,
  longitude: 106.3452,
  topicCode: "chua",
};

async function upsertAdmin(pool: Pool): Promise<string> {
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, SALT_ROUNDS);
  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO iam.users (email, password_hash, display_name, role, email_verified_at)
     VALUES ($1, $2, $3, 'SYSTEM_ADMIN', now())
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [SEED_ADMIN_EMAIL, passwordHash, SEED_ADMIN_NAME]
  );

  if (inserted.rows.length > 0) {
    console.log(`[seed] da tao tai khoan SYSTEM_ADMIN: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`);
    console.log(`[seed] CHI DUNG CHO LOCAL DEV/DEMO — doi mat khau truoc khi dung o staging/production.`);
    return inserted.rows[0].id;
  }

  console.log(`[seed] tai khoan ${SEED_ADMIN_EMAIL} da ton tai, bo qua.`);
  const existing = await pool.query<{ id: string }>(`SELECT id FROM iam.users WHERE email = $1`, [
    SEED_ADMIN_EMAIL,
  ]);
  return existing.rows[0].id;
}

async function seedTopicTaxonomy(pool: Pool): Promise<void> {
  for (const term of TOPIC_TERMS) {
    await pool.query(
      `INSERT INTO heritage.taxonomy_terms (scheme, code, label)
       VALUES ('topic', $1, $2)
       ON CONFLICT (scheme, code) DO NOTHING`,
      [term.code, term.label]
    );
  }
  console.log(`[seed] taxonomy scheme "topic": ${TOPIC_TERMS.length} term (idempotent).`);
}

interface SourceSeed {
  title: string;
  author: string;
  url: string;
  reliability: string;
}

async function upsertSource(pool: Pool, source: SourceSeed, createdBy: string): Promise<string> {
  const existing = await pool.query<{ id: string }>(`SELECT id FROM heritage.sources WHERE url = $1`, [source.url]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO heritage.sources (title, author, url, reliability, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [source.title, source.author, source.url, source.reliability, createdBy]
  );
  return rows[0].id;
}

async function seedPlace(client: PoolClient, place: PlaceSeed, createdBy: string, sourceId: string): Promise<string> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM heritage.entities WHERE canonical_code = $1`, [
    place.canonicalCode,
  ]);
  if (existing.rows.length > 0) {
    console.log(`[seed] dia diem "${place.preferredLabel}" da ton tai, bo qua.`);
    return existing.rows[0].id;
  }

  await client.query("BEGIN");
  try {
    const entityResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entities (canonical_code, entity_type, access_level, created_by)
       VALUES ($1, 'PLACE', 'PUBLIC', $2)
       RETURNING id`,
      [place.canonicalCode, createdBy]
    );
    const entityId = entityResult.rows[0].id;

    const versionResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entity_versions
         (entity_id, version_no, publication_status, verification_level, sensitivity_level,
          preferred_label, description, created_by)
       VALUES ($1, 1, 'PUBLISHED', 'EXPERT_REVIEWED', 'PUBLIC', $2, $3, $4)
       RETURNING id`,
      [entityId, place.preferredLabel, place.description, createdBy]
    );
    const versionId = versionResult.rows[0].id;

    await client.query(`UPDATE heritage.entities SET current_version_id = $2 WHERE id = $1`, [
      entityId,
      versionId,
    ]);

    await client.query(
      `INSERT INTO place.places
         (entity_id, place_type, local_name, location, visitor_summary, etiquette_note,
          administrative_area, last_verified_at)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, 'Trà Vinh', now())`,
      [entityId, place.placeType, place.localName, place.longitude, place.latitude, place.visitorSummary, place.etiquetteNote]
    );

    await client.query(
      `INSERT INTO heritage.version_sources (entity_version_id, source_id) VALUES ($1, $2)`,
      [versionId, sourceId]
    );

    const termResult = await client.query<{ id: string }>(
      `SELECT id FROM heritage.taxonomy_terms WHERE scheme = 'topic' AND code = $1`,
      [place.topicCode]
    );
    if (termResult.rows.length > 0) {
      await client.query(
        `INSERT INTO heritage.entity_categories (entity_id, term_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [entityId, termResult.rows[0].id]
      );
    }

    await client.query("COMMIT");
    console.log(`[seed] da tao dia diem "${place.preferredLabel}" (PUBLISHED).`);
    return entityId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Tu vung Khmer co ban — day la du lieu seed dev/demo, CAN nguoi ban ngu Khmer ra soat lai
 * chinh ta/dau truoc khi dung o staging/production (dung theo yeu cau cua tai lieu goc muc
 * 16.3: "Noi dung tieng Khmer can duoc kiem duyet boi nguoi co chuyen mon").
 * placeCanonicalCode (neu co) lien ket tu voi 1 dia diem da seed o tren.
 */
interface TermSeed {
  khmerText: string;
  latinTransliteration: string;
  meaningVi: string;
  meaningEn: string;
  placeCanonicalCode?: string;
}

const TERMS: TermSeed[] = [
  { khmerText: "សួស្តី", latinTransliteration: "suostei", meaningVi: "Xin chào", meaningEn: "Hello" },
  { khmerText: "អរគុណ", latinTransliteration: "arkoun", meaningVi: "Cảm ơn", meaningEn: "Thank you" },
  { khmerText: "សូម", latinTransliteration: "som", meaningVi: "Xin (làm ơn)", meaningEn: "Please" },
  { khmerText: "ទោស", latinTransliteration: "toh", meaningVi: "Xin lỗi", meaningEn: "Sorry" },
  { khmerText: "មួយ", latinTransliteration: "muy", meaningVi: "Một", meaningEn: "One" },
  { khmerText: "ពីរ", latinTransliteration: "pii", meaningVi: "Hai", meaningEn: "Two" },
  { khmerText: "បី", latinTransliteration: "bei", meaningVi: "Ba", meaningEn: "Three" },
  {
    khmerText: "វត្ត",
    latinTransliteration: "voat",
    meaningVi: "Chùa",
    meaningEn: "Pagoda / Wat",
    placeCanonicalCode: "PLACE-CHUA-ANG",
  },
  { khmerText: "ព្រះសង្ឃ", latinTransliteration: "preah sang", meaningVi: "Nhà sư", meaningEn: "Monk" },
  { khmerText: "ភូមិ", latinTransliteration: "phum", meaningVi: "Phum (làng)", meaningEn: "Village" },
  { khmerText: "ស្រុក", latinTransliteration: "srok", meaningVi: "Sóc (xứ, vùng)", meaningEn: "District / homeland" },
  { khmerText: "បុណ្យ", latinTransliteration: "bon", meaningVi: "Lễ hội", meaningEn: "Festival" },
  { khmerText: "ទឹក", latinTransliteration: "teuk", meaningVi: "Nước", meaningEn: "Water" },
  {
    khmerText: "ព្រះច័ន្ទ",
    latinTransliteration: "preah chan",
    meaningVi: "Mặt trăng",
    meaningEn: "Moon",
  },
  { khmerText: "ទូក", latinTransliteration: "tuk", meaningVi: "Ghe, thuyền", meaningEn: "Boat" },
  { khmerText: "ភ្លេង", latinTransliteration: "phleng", meaningVi: "Nhạc", meaningEn: "Music" },
  { khmerText: "របាំ", latinTransliteration: "roboam", meaningVi: "Múa", meaningEn: "Dance" },
  { khmerText: "អាហារ", latinTransliteration: "ahar", meaningVi: "Thức ăn", meaningEn: "Food" },
  { khmerText: "ខ្មែរ", latinTransliteration: "khmer", meaningVi: "Khmer", meaningEn: "Khmer" },
  {
    khmerText: "អរុណសួស្តី",
    latinTransliteration: "arun suostei",
    meaningVi: "Chào buổi sáng",
    meaningEn: "Good morning",
  },
];

async function seedTerm(
  client: PoolClient,
  term: TermSeed,
  createdBy: string,
  entityIdByCode: Map<string, string>
): Promise<void> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM handbook.terms WHERE khmer_text = $1`, [
    term.khmerText,
  ]);
  if (existing.rows.length > 0) return;

  const entityId = term.placeCanonicalCode ? entityIdByCode.get(term.placeCanonicalCode) : undefined;
  await client.query(
    `INSERT INTO handbook.terms (khmer_text, latin_transliteration, meaning_vi, meaning_en, entity_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [term.khmerText, term.latinTransliteration, term.meaningVi, term.meaningEn, entityId ?? null, createdBy]
  );
}

/** Cau hoi quiz — dua tren chinh du lieu Place/heritage entity da seed o tren, tranh bia them "su that" ngoai pham vi. */
interface QuestionSeed {
  questionText: string;
  choices: Array<{ id: string; text: string }>;
  correctChoiceId: string;
  explanation?: string;
  entityCanonicalCode?: string;
}

const QUESTIONS: QuestionSeed[] = [
  {
    questionText: "Chùa Âng tại Trà Vinh thuộc hệ phái Phật giáo nào?",
    choices: [
      { id: "a", text: "Phật giáo Nam tông Khmer" },
      { id: "b", text: "Phật giáo Bắc tông" },
      { id: "c", text: "Cao Đài" },
      { id: "d", text: "Tin Lành" },
    ],
    correctChoiceId: "a",
    explanation: "Chùa Âng là ngôi chùa Khmer cổ, kiến trúc Phật giáo Nam tông Khmer tiêu biểu tại Trà Vinh.",
    entityCanonicalCode: "PLACE-CHUA-ANG",
  },
  {
    questionText: "Ao Bà Om nằm trong cụm di tích cùng với những địa điểm nào?",
    choices: [
      { id: "a", text: "Chùa Âng và Bảo tàng Văn hóa dân tộc Khmer" },
      { id: "b", text: "Núi Bà Đen và Hồ Xuân Hương" },
      { id: "c", text: "Chợ Bến Thành" },
      { id: "d", text: "Địa đạo Củ Chi" },
    ],
    correctChoiceId: "a",
    explanation: "Ao Bà Om nằm liền kề Chùa Âng và Bảo tàng Văn hóa dân tộc Khmer trong cùng một cụm di tích.",
    entityCanonicalCode: "PLACE-AO-BA-OM",
  },
  {
    questionText: "Bảo tàng Văn hóa dân tộc Khmer tại Trà Vinh trưng bày chủ yếu về điều gì?",
    choices: [
      { id: "a", text: "Hiện vật, trang phục, nhạc cụ văn hóa Khmer" },
      { id: "b", text: "Vũ khí thời chiến" },
      { id: "c", text: "Đồ gốm sứ Trung Hoa" },
      { id: "d", text: "Tranh sơn dầu phương Tây" },
    ],
    correctChoiceId: "a",
    explanation: "Bảo tàng trưng bày hiện vật, trang phục, nhạc cụ và tư liệu về đời sống văn hóa Khmer Nam Bộ.",
    entityCanonicalCode: "PLACE-BAO-TANG-KHMER",
  },
  {
    questionText: "Cụm di tích Ao Bà Om – Chùa Âng – Bảo tàng Văn hóa dân tộc Khmer nằm ở tỉnh nào?",
    choices: [
      { id: "a", text: "Trà Vinh" },
      { id: "b", text: "Sóc Trăng" },
      { id: "c", text: "An Giang" },
      { id: "d", text: "Kiên Giang" },
    ],
    correctChoiceId: "a",
  },
  {
    questionText: "Từ \"វត្ត\" (voat) trong tiếng Khmer có nghĩa là gì?",
    choices: [
      { id: "a", text: "Chùa" },
      { id: "b", text: "Nhà" },
      { id: "c", text: "Chợ" },
      { id: "d", text: "Sông" },
    ],
    correctChoiceId: "a",
    explanation: "\"វត្ត\" (voat) nghĩa là chùa/wat — dùng phổ biến để gọi tên các ngôi chùa Khmer.",
  },
  {
    questionText: "\"សួស្តី\" (suostei) dùng để làm gì khi giao tiếp?",
    choices: [
      { id: "a", text: "Chào hỏi" },
      { id: "b", text: "Cảm ơn" },
      { id: "c", text: "Xin lỗi" },
      { id: "d", text: "Tạm biệt" },
    ],
    correctChoiceId: "a",
    explanation: "\"សួស្តី\" (suostei) là lời chào hỏi thông dụng trong tiếng Khmer.",
  },
  // FR-FES-007 (MUST/R1): "Mot bo noi dung dua ghe Ngo mau co nguon" — lien ket entity
  // HERITAGE-DUA-GHE-NGO duoc seed o seedIntangibleHeritage(), dan qua entityCanonicalCode.
  {
    questionText: "Đua ghe Ngo là hoạt động gắn liền với lễ hội nào của người Khmer Nam Bộ?",
    choices: [
      { id: "a", text: "Lễ hội Ok Om Bok" },
      { id: "b", text: "Tết Nguyên Đán" },
      { id: "c", text: "Lễ hội Trung thu" },
      { id: "d", text: "Giỗ tổ Hùng Vương" },
    ],
    correctChoiceId: "a",
    explanation: "Đua ghe Ngo là một trong những hoạt động trọng tâm của Lễ hội Ok Om Bok tại Trà Vinh.",
    entityCanonicalCode: "HERITAGE-DUA-GHE-NGO",
  },
  {
    questionText: "Các đội ghe Ngo tham gia thi đấu thường đại diện cho đơn vị nào?",
    choices: [
      { id: "a", text: "Phum sóc, chùa trong vùng" },
      { id: "b", text: "Công ty tư nhân" },
      { id: "c", text: "Trường đại học" },
      { id: "d", text: "Cơ quan nhà nước trung ương" },
    ],
    correctChoiceId: "a",
    explanation: "Đội ghe Ngo thường gắn với phum sóc, chùa — thể hiện tinh thần cộng đồng địa phương.",
    entityCanonicalCode: "HERITAGE-DUA-GHE-NGO",
  },
  {
    questionText: "Ý nghĩa chính của đua ghe Ngo trong đời sống cộng đồng Khmer Nam Bộ là gì?",
    choices: [
      { id: "a", text: "Thể hiện tinh thần đoàn kết cộng đồng" },
      { id: "b", text: "Tranh giải thưởng tiền mặt lớn" },
      { id: "c", text: "Quảng bá thương hiệu doanh nghiệp" },
      { id: "d", text: "Thi đấu thể thao chuyên nghiệp quốc tế" },
    ],
    correctChoiceId: "a",
    explanation: "Đua ghe Ngo gắn với tinh thần đoàn kết, gắn kết cộng đồng phum sóc hơn là tính chất thi đấu chuyên nghiệp.",
    entityCanonicalCode: "HERITAGE-DUA-GHE-NGO",
  },
];

async function seedQuestion(
  client: PoolClient,
  question: QuestionSeed,
  createdBy: string,
  entityIdByCode: Map<string, string>
): Promise<string | null> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM olympiad.questions WHERE question_text = $1`, [
    question.questionText,
  ]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const entityId = question.entityCanonicalCode ? entityIdByCode.get(question.entityCanonicalCode) : undefined;
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO olympiad.questions (entity_id, question_text, choices, correct_choice_id, explanation, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      entityId ?? null,
      question.questionText,
      JSON.stringify(question.choices),
      question.correctChoiceId,
      question.explanation ?? null,
      createdBy,
    ]
  );
  return rows[0].id;
}

const DEMO_COMPETITION_TITLE = "Olympiad demo — Khám phá Trà Vinh";

async function seedDemoCompetition(
  client: PoolClient,
  questionIds: string[],
  createdBy: string,
  organizationId: string
): Promise<void> {
  const existing = await client.query<{ id: string; room_code: string; organization_id: string | null }>(
    `SELECT id, room_code, organization_id FROM olympiad.competitions WHERE title = $1`,
    [DEMO_COMPETITION_TITLE]
  );
  if (existing.rows.length > 0) {
    // Retrofit (M8): phong thi demo tao tu M4 chua thuoc to chuc nao — gan lai FR-ORG-003.
    if (!existing.rows[0].organization_id) {
      await client.query(`UPDATE olympiad.competitions SET organization_id = $2 WHERE id = $1`, [
        existing.rows[0].id,
        organizationId,
      ]);
      console.log(`[seed] da gan phong thi demo vao to chuc (retrofit FR-ORG-003).`);
    }
    console.log(`[seed] phong thi demo da ton tai, ma phong: ${existing.rows[0].room_code}`);
    return;
  }

  const roomCode = "DEMO01";
  const competitionResult = await client.query<{ id: string }>(
    `INSERT INTO olympiad.competitions (title, status, room_code, created_by, organization_id)
     VALUES ($1, 'OPEN', $2, $3, $4)
     RETURNING id`,
    [DEMO_COMPETITION_TITLE, roomCode, createdBy, organizationId]
  );
  const competitionId = competitionResult.rows[0].id;

  for (const [index, questionId] of questionIds.entries()) {
    await client.query(
      `INSERT INTO olympiad.competition_questions (competition_id, question_id, order_index) VALUES ($1, $2, $3)`,
      [competitionId, questionId, index]
    );
  }
  console.log(`[seed] da tao phong thi demo "${DEMO_COMPETITION_TITLE}", ma phong: ${roomCode}`);
}

const DEMO_ORG_NAME = "Ban Tổ chức Lễ hội Chùa Âng";

/** FR-ORG-003 (MUST/R1): "R1 cho phep mot organization demo." */
async function upsertDemoOrganization(client: PoolClient, createdBy: string, homePlaceId: string): Promise<string> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM iam.organizations WHERE name = $1`, [
    DEMO_ORG_NAME,
  ]);
  if (existing.rows.length > 0) {
    console.log(`[seed] to chuc demo "${DEMO_ORG_NAME}" da ton tai, bo qua.`);
    return existing.rows[0].id;
  }

  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO iam.organizations (name, org_type, home_place_id, created_by)
     VALUES ($1, 'PAGODA', $2, $3)
     RETURNING id`,
    [DEMO_ORG_NAME, homePlaceId, createdBy]
  );
  const organizationId = rows[0].id;

  await client.query(
    `INSERT INTO iam.organization_memberships (organization_id, user_id, role)
     VALUES ($1, $2, 'MANAGER')
     ON CONFLICT (organization_id, user_id) DO NOTHING`,
    [organizationId, createdBy]
  );
  console.log(`[seed] da tao to chuc demo "${DEMO_ORG_NAME}".`);
  return organizationId;
}

/**
 * Tao 1 heritage entity PUBLISHED gan nguon — dung chung cho Dua ghe Ngo (INTANGIBLE_HERITAGE)
 * o M8. Khong qua PhumDataService (seed script luon ghi thang DB, giong pattern seedPlace) nhung
 * van gan version_sources de ton trong nguyen tac "one knowledge core" nhu moi noi dung khac.
 */
async function seedHeritageEntity(
  client: PoolClient,
  input: { canonicalCode: string; entityType: string; preferredLabel: string; description: string },
  createdBy: string,
  sourceIds: string[]
): Promise<string> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM heritage.entities WHERE canonical_code = $1`, [
    input.canonicalCode,
  ]);
  if (existing.rows.length > 0) {
    console.log(`[seed] noi dung "${input.preferredLabel}" da ton tai, bo qua.`);
    return existing.rows[0].id;
  }

  await client.query("BEGIN");
  try {
    const entityResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entities (canonical_code, entity_type, access_level, created_by)
       VALUES ($1, $2, 'PUBLIC', $3)
       RETURNING id`,
      [input.canonicalCode, input.entityType, createdBy]
    );
    const entityId = entityResult.rows[0].id;

    const versionResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entity_versions
         (entity_id, version_no, publication_status, verification_level, sensitivity_level,
          preferred_label, description, created_by)
       VALUES ($1, 1, 'PUBLISHED', 'SOURCE_VERIFIED', 'PUBLIC', $2, $3, $4)
       RETURNING id`,
      [entityId, input.preferredLabel, input.description, createdBy]
    );
    const versionId = versionResult.rows[0].id;

    await client.query(`UPDATE heritage.entities SET current_version_id = $2 WHERE id = $1`, [entityId, versionId]);

    for (const sourceId of sourceIds) {
      await client.query(`INSERT INTO heritage.version_sources (entity_version_id, source_id) VALUES ($1, $2)`, [
        versionId,
        sourceId,
      ]);
    }

    await client.query("COMMIT");
    console.log(`[seed] da tao noi dung "${input.preferredLabel}" (PUBLISHED, ${sourceIds.length} nguon).`);
    return entityId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * FR-FES-001 (MUST/R1): "He thong phai co trang le hoi voi mo ta, dia diem, thoi gian, chuong
 * trinh... Hien thi mot le hoi mau tu PhumData." Ngay to chuc cu the theo lich am moi nam nen
 * KHONG bia ngay chinh xac (dung nguyen tac AI Spec "khong chot so lieu gia") — dung 1 ngay uoc
 * luong trong mua le hoi thuc te (thang 11 duong lich) voi status PLANNED va ghi chu ro trong
 * mo ta.
 */
async function seedFestival(
  client: PoolClient,
  createdBy: string,
  organizationId: string,
  placeId: string,
  sourceIds: string[]
): Promise<void> {
  const canonicalCode = "EVENT-OK-OM-BOK";
  const existingEntity = await client.query<{ id: string }>(
    `SELECT id FROM heritage.entities WHERE canonical_code = $1`,
    [canonicalCode]
  );
  if (existingEntity.rows.length > 0) {
    console.log(`[seed] le hoi "Ok Om Bok" da ton tai, bo qua.`);
    return;
  }

  const description =
    "Ok Om Bok (lễ cúng trăng) là một trong ba lễ lớn của người Khmer Nam Bộ, tổ chức vào rằm " +
    "tháng 10 âm lịch hằng năm tại Trà Vinh — gồm nghi lễ cúng trăng, thả đèn nước và đua ghe " +
    "Ngo. Ngày dương lịch cụ thể mỗi năm thay đổi theo lịch âm — cần xác nhận lại gần thời điểm " +
    "tổ chức, ngày hiển thị dưới đây chỉ là ước lượng cho mùa lễ hội.";

  await client.query("BEGIN");
  try {
    const entityResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entities (canonical_code, entity_type, access_level, created_by)
       VALUES ($1, 'EVENT', 'PUBLIC', $2)
       RETURNING id`,
      [canonicalCode, createdBy]
    );
    const entityId = entityResult.rows[0].id;

    const versionResult = await client.query<{ id: string }>(
      `INSERT INTO heritage.entity_versions
         (entity_id, version_no, publication_status, verification_level, sensitivity_level,
          preferred_label, description, created_by)
       VALUES ($1, 1, 'PUBLISHED', 'SOURCE_VERIFIED', 'PUBLIC', 'Lễ hội Ok Om Bok', $2, $3)
       RETURNING id`,
      [entityId, description, createdBy]
    );
    const versionId = versionResult.rows[0].id;

    await client.query(`UPDATE heritage.entities SET current_version_id = $2 WHERE id = $1`, [entityId, versionId]);

    for (const sourceId of sourceIds) {
      await client.query(`INSERT INTO heritage.version_sources (entity_version_id, source_id) VALUES ($1, $2)`, [
        versionId,
        sourceId,
      ]);
    }

    const festivalResult = await client.query<{ id: string }>(
      `INSERT INTO place.festivals (entity_id, recurrence_rule, organizer_org_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [entityId, "Hằng năm, rằm tháng 10 âm lịch (khoảng tháng 11 dương lịch)", organizationId]
    );
    const festivalId = festivalResult.rows[0].id;

    const occurrenceResult = await client.query<{ id: string }>(
      `INSERT INTO place.festival_occurrences (festival_id, place_id, starts_at, status)
       VALUES ($1, $2, $3, 'PLANNED')
       RETURNING id`,
      [festivalId, placeId, "2026-11-24T00:00:00+07:00"]
    );
    const occurrenceId = occurrenceResult.rows[0].id;

    const events = [
      { eventType: "CEREMONY", title: "Cúng trăng (Ok Om Bok)", note: "Nghi lễ tạ ơn thần Mặt Trăng, cầu mùa màng bội thu." },
      { eventType: "CEREMONY", title: "Thả đèn nước", note: "Thả đèn hoa đăng trên sông, cầu bình an." },
      { eventType: "BOAT_RACE", title: "Đua ghe Ngo", note: "Các đội ghe từ phum sóc, chùa trong vùng thi đấu trên sông." },
    ];
    for (const event of events) {
      await client.query(
        `INSERT INTO place.festival_events (occurrence_id, event_type, title, note) VALUES ($1, $2, $3, $4)`,
        [occurrenceId, event.eventType, event.title, event.note]
      );
    }

    // FR-FES-002: overlay tien ich/an toan — du lieu minh hoa (khong co toa do chinh xac that,
    // chi la vi du dung theo dung tinh chat "khi co du lieu" cua yeu cau).
    const facilities = [
      { facilityType: "PARKING", note: "Bãi giữ xe khu vực Ao Bà Om." },
      { facilityType: "MEDICAL", note: "Điểm sơ cứu y tế gần khu vực đua ghe." },
      { facilityType: "RESTROOM", note: "Nhà vệ sinh công cộng quanh hồ." },
      { facilityType: "SAFETY_WARNING", note: "Khu vực bờ hồ đông người — trông chừng trẻ nhỏ." },
    ];
    for (const facility of facilities) {
      await client.query(
        `INSERT INTO place.festival_facilities (occurrence_id, facility_type, note) VALUES ($1, $2, $3)`,
        [occurrenceId, facility.facilityType, facility.note]
      );
    }

    await client.query("COMMIT");
    console.log(
      `[seed] da tao le hoi "Ok Om Bok" (PUBLISHED, ${sourceIds.length} nguon, 3 hoat dong, ${facilities.length} tien ich).`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

const DEMO_BOAT_TEAM_NAME = "Đội ghe Ngo Chùa Âng (demo)";

/** FR-FES-004: 1 ho so doi ghe Ngo mau — chi ten/dia phuong/mau sac/cau chuyen, khong du lieu thanh vien ca nhan. */
async function seedBoatTeam(client: PoolClient, createdBy: string, organizationId: string, homePlaceId: string): Promise<void> {
  const existing = await client.query<{ id: string }>(`SELECT id FROM place.boat_teams WHERE display_name = $1`, [
    DEMO_BOAT_TEAM_NAME,
  ]);
  if (existing.rows.length > 0) {
    console.log(`[seed] doi ghe demo da ton tai, bo qua.`);
    return;
  }
  await client.query(
    `INSERT INTO place.boat_teams (display_name, organization_id, home_place_id, symbol_color, story, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      DEMO_BOAT_TEAM_NAME,
      organizationId,
      homePlaceId,
      "#C79A3B",
      "Đội ghe minh hoạ gắn với cụm Chùa Âng, đại diện cho tinh thần thi đấu đua ghe Ngo mùa Ok Om Bok.",
      createdBy,
    ]
  );
  console.log(`[seed] da tao doi ghe demo "${DEMO_BOAT_TEAM_NAME}".`);
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await seedTopicTaxonomy(pool);
    const adminId = await upsertAdmin(pool);
    const sourceId = await upsertSource(pool, CLUSTER_SOURCE, adminId);
    const okOmBokSourceId = await upsertSource(pool, OK_OM_BOK_SOURCE, adminId);
    const heritageRegistrySourceId = await upsertSource(pool, HERITAGE_REGISTRY_SOURCE, adminId);
    const ongMetSourceId = await upsertSource(pool, ONG_MET_SOURCE, adminId);

    const client = await pool.connect();
    try {
      const entityIdByCode = new Map<string, string>();
      for (const place of PLACES) {
        const entityId = await seedPlace(client, place, adminId, sourceId);
        entityIdByCode.set(place.canonicalCode, entityId);
      }
      // M11: dia diem thu 4, doc lap voi cum Chua Ang — xem chu thich ONG_MET_PLACE.
      const ongMetEntityId = await seedPlace(client, ONG_MET_PLACE, adminId, ongMetSourceId);
      entityIdByCode.set(ONG_MET_PLACE.canonicalCode, ongMetEntityId);

      for (const term of TERMS) {
        await seedTerm(client, term, adminId, entityIdByCode);
      }
      console.log(`[seed] tu vung Khmer: ${TERMS.length} tu (idempotent).`);

      // M8: to chuc demo + Festival Mode toi thieu (dong no ky thuat FR-ORG-003/004, FR-FES-001/007).
      const chuaAngEntityId = entityIdByCode.get("PLACE-CHUA-ANG") as string;
      const organizationId = await upsertDemoOrganization(client, adminId, chuaAngEntityId);

      const okOmBokSourceIds = [okOmBokSourceId, heritageRegistrySourceId];
      const duaGheNgoEntityId = await seedHeritageEntity(
        client,
        {
          canonicalCode: "HERITAGE-DUA-GHE-NGO",
          entityType: "INTANGIBLE_HERITAGE",
          preferredLabel: "Đua ghe Ngo",
          description:
            "Đua ghe Ngo là môn thể thao truyền thống gắn liền với Lễ hội Ok Om Bok của người " +
            "Khmer Nam Bộ tại Trà Vinh — các đội ghe từ phum sóc, chùa trong vùng thi đấu trên " +
            "sông, thể hiện tinh thần đoàn kết cộng đồng và là một trong những hoạt động thu hút " +
            "đông đảo người xem nhất của lễ hội.",
        },
        adminId,
        okOmBokSourceIds
      );
      entityIdByCode.set("HERITAGE-DUA-GHE-NGO", duaGheNgoEntityId);

      // M11: mo rong du lieu van hoa phi vat the that — dung lai HERITAGE_REGISTRY_SOURCE da
      // xac minh tu M8 (danh muc Cuc Di san van hoa neu dich danh ca 2 loai hinh nay tai Tra
      // Vinh), khong bia nguon rieng moi cho tung muc (dung nguyen tac "one knowledge core").
      await seedHeritageEntity(
        client,
        {
          canonicalCode: "HERITAGE-CHAM-RIENG-CHA-PAY",
          entityType: "INTANGIBLE_HERITAGE",
          preferredLabel: "Nghệ thuật Chầm riêng chà pây",
          description:
            "Chầm riêng chà pây là hình thức ca hát dân gian của người Khmer Nam Bộ, gắn với " +
            "cây đàn chà pây đưng (đàn dây cổ truyền, thân dài) — người hát vừa đệm đàn vừa kể " +
            "chuyện bằng lời ca, phổ biến tại vùng Tân Hiệp, huyện Trà Cú, tỉnh Trà Vinh. Được " +
            "ghi danh trong Danh mục Di sản văn hóa phi vật thể quốc gia.",
        },
        adminId,
        [heritageRegistrySourceId]
      );

      await seedHeritageEntity(
        client,
        {
          canonicalCode: "HERITAGE-ROBAM",
          entityType: "INTANGIBLE_HERITAGE",
          preferredLabel: "Nghệ thuật Rô-băm",
          description:
            "Rô-băm là loại hình sân khấu múa mặt nạ truyền thống của người Khmer Nam Bộ, kết " +
            "hợp múa, kịch câm và âm nhạc để diễn lại các tích truyện dân gian, được gìn giữ và " +
            "trình diễn tại Trà Vinh. Được ghi danh trong Danh mục Di sản văn hóa phi vật thể " +
            "quốc gia.",
        },
        adminId,
        [heritageRegistrySourceId]
      );

      await seedFestival(client, adminId, organizationId, chuaAngEntityId, okOmBokSourceIds);
      await seedBoatTeam(client, adminId, organizationId, chuaAngEntityId);

      const questionIds: string[] = [];
      for (const question of QUESTIONS) {
        const questionId = await seedQuestion(client, question, adminId, entityIdByCode);
        if (questionId) questionIds.push(questionId);
      }
      console.log(`[seed] cau hoi quiz: ${QUESTIONS.length} cau (idempotent).`);

      await seedDemoCompetition(client, questionIds, adminId, organizationId);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("[seed] that bai:", error);
  process.exitCode = 1;
});
