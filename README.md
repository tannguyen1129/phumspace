# PhumSpace

Nen tang trai nghiem du lich so ve van hoa Khmer Nam Bo, khoi tao tai Tra Vinh. PhumData la kho tri thuc loi; AI (Gemini) chi ho tro dien giai, khong phai nguon su that doc lap.

Dac ta day du: xem `docs/`. Ke hoach trien khai: xem `/home/sontan29/.claude/plans/shiny-wandering-clarke.md` (Roadmap 4 giai doan + ke hoach ky thuat chi tiet GD1-MVP).

## Cau truc monorepo

```
apps/
  web/       Next.js PWA (App Router) + Admin Portal
  api/       NestJS REST API — 12 module domain theo DDD (interface/application/domain/infrastructure)
  worker/    NestJS worker — BullMQ consumer (AI scan job, media, TTS, notification)
packages/
  contracts/ DTO & schema dung chung (bao gom JSON Schema Scanner)
  ui/        Design tokens (mau, typography Khmer) va component dung chung
  config/    Env schema + nguong cau hinh (vd nguong confidence AI Scanner)
  db/        Migration Postgres (node-pg-migrate) va seed script
infra/
  docker-compose.yml   postgres+postgis, redis, minio, api, worker, web
```

## Chay local

```bash
cp .env.example .env
pnpm install
docker compose -f infra/docker-compose.yml up -d postgres redis minio
pnpm migrate
pnpm seed        # controlled vocabulary (taxonomy "topic") + 1 tai khoan SYSTEM_ADMIN
pnpm dev:api     # http://localhost:3001 (xem API_PORT trong .env)
pnpm dev:worker
pnpm dev:web     # http://localhost:3000 (xem WEB_PORT trong .env)
```

Bien moi truong quan trong trong `.env` (day du o `.env.example`): `DATABASE_URL`, `REDIS_URL`,
`S3_ENDPOINT`/`MEDIA_BUCKET` (MinIO), `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (doi truoc khi
deploy that), `GEMINI_API_KEY`, `SCANNER_CONFIDENCE_*` (nguong AI Scanner), `WEB_BASE_URL` (CORS
allowlist cua API — xem muc M6 ben duoi). `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (tuy chon)
doi tai khoan admin duoc seed ben duoi.

**AI Scanner (Milestone M3)**: neu `GEMINI_API_KEY` de trong, `POST /v1/scanner/scans` van hoat
dong binh thuong nhung worker se tra ve `decision: "UNKNOWN"` kem `requiresHumanReview: true`
(graceful-degradation dung theo AI_Specification, khong crash job). Dan `GEMINI_API_KEY` that
vao `.env` de kich hoat nhan dien qua Gemini (`GoogleGenAI`, xem
`apps/worker/src/modules/scanner/application/gemini.adapter.ts`).

### Tai khoan test (tao boi `pnpm seed`, chi dung local dev/demo)

| Vai tro | Email | Mat khau |
|---|---|---|
| SYSTEM_ADMIN | `admin@phumspace.dev` | `ChangeMe123!` |

Doi mat khau (qua `SEED_ADMIN_PASSWORD` truoc khi seed) neu dung o staging/production — khong
bao gio dung tai khoan nay ngoai moi truong local. Tai khoan REGISTERED_USER thuong tu tao qua
`POST /v1/identity/register` hoac man hinh `/register` tren web.

### Handbook & Olympiad (Milestone M4)

`pnpm seed` tao san 20 tu vung Khmer co ban va 6 cau hoi quiz gan voi 3 dia diem da seed, cong
1 phong thi demo **ma phong `DEMO01`** (vao truc tiep tai `/quiz/room/DEMO01` tren web hoac qua
`POST /v1/olympiad/competitions/room/DEMO01/join`). Tu vung tieng Khmer trong seed data la du
lieu dev/demo, CAN nguoi ban ngu Khmer ra soat lai truoc khi dung o staging/production (dung yeu
cau cua tai lieu goc muc 16.3).

### Contribution & Moderation — khep vong du lieu (Milestone M5)

Bat ky REGISTERED_USER nao cung co the gui dong gop audio tai `/contribute` (web) hoac
`POST /v1/contribution/contributions` (API, multipart: file `audio` + `termId` de bo sung audio
cho tu da co, hoac `proposedKhmerText`/`proposedMeaningVi` de de xuat tu moi), kem
`consentScope`, `aiPermission`, ghi cong tuy chon (bo trong = an danh) va co the danh dau
`sensitive`. Chi REVIEWER/PUBLISHER/SYSTEM_ADMIN moi goi duoc API kiem duyet
(`GET /v1/moderation/queue`, `GET /v1/moderation/contributions/:id`,
`POST /v1/moderation/contributions/:id/decide` voi `decision` la `APPROVED` |
`CHANGES_REQUESTED` | `REJECTED`, bat buoc `reason` khi tu choi/yeu cau sua) hoac trang web
`/moderation`; goi bang REGISTERED_USER thuong tra ve `403`.

Khi duyet (`APPROVED`), `ModerationService.publish()` tu dong: tao tu vung moi trong Handbook
neu dong gop chua co `termId`, dang ky audio da upload vao `handbook.term_audio` (khong upload
lai file), roi cap nhat dong gop sang `status: "PUBLISHED"` kem `resultTermId`/`resultAudioId` —
day chinh la vong khep kin "cong dong dong gop → kiem duyet → xuat hien lai trong Handbook/Scanner"
theo kich ban demo 7 buoc. Moi quyet dinh kiem duyet va hanh dong gui/rut dong gop deu ghi vao
`ops.audit_events` (`AuditLogService`). Da xac minh bang curl toan bo chuoi: gui dong gop moi →
duyet → `GET /v1/handbook/terms/:resultTermId` tra ve dung tu + audio vua duyet; cung da test
duong tu choi (bat buoc `reason`, tra `400` neu thieu), duong yeu cau chinh sua, rut dong gop
(chi khi con `SUBMITTED`), va 403 cho nguoi khong co quyen kiem duyet.

### Personalization, Offline & Hardening (Milestone M6)

**Khu vuc "Toi" (`/me`, FR-PER-001..007)** — 5 tab: Da luu, Lich su quet, Offline, Tuy chon,
Tai khoan.
- **Da luu**: `POST /v1/personalization/saved` voi `entityId` (dia diem/thuc the van hoa) hoac
  `termId` (tu vung Handbook) — idempotent, goi lai khong tao trung (unique index rieng cho tung
  loai). Nut Luu/Bo luu (`SaveButton`) co san tren Place Detail va Handbook term.
- **Lich su quet**: `GET/DELETE /v1/personalization/history` qua facade `ScannerService` — xoa
  la xoa that ca ban ghi DB lan anh tren MinIO, khong phai an di.
- **Xuat/xoa du lieu ca nhan (FR-PER-007)**: `GET /v1/personalization/export` tra JSON gop ho so +
  da luu + lich su quet + dong gop (tai truc tiep tu trinh duyet). `POST
  /v1/personalization/delete-account` **an danh hoa** tai khoan (doi email/ten, xoa mat khau cu,
  thu hoi moi refresh token) thay vi xoa cung ban ghi `iam.users` — vi cac bang khac (contributions,
  entities, terms da tao...) tham chieu toi ma khong co `ON DELETE CASCADE`, va noi dung da cong
  bo can giu attribution/audit theo dung nguyen tac consent. Du lieu hoan toan rieng tu (saved
  items, lich su quet + anh) bi xoa that.
- **Tuy chon (FR-PER-004)**: ngon ngu, interest tags, va accessibility preferences
  (`reducedMotion`, `largeText`) qua `PATCH /v1/identity/me/preferences` — ap dung ngay qua
  thuoc tinh `data-*` tren `<html>` (xem `globals.css`), khong suy luan tu du lieu nao khac.

**Offline (FR-PWA-001..005)** — `public/sw.js` viet lai theo 3 lop cache (System Design muc 17.1):
app shell (precache, versioned, don khi deploy moi), noi dung PhumData/Handbook/Discovery
(stale-while-revalidate), va goi noi dung nguoi dung **chu dong** tai xuong qua nut "Tai xuong
offline" tren Place Detail/Handbook term (`lib/offline-downloads.ts`, cache rieng
`phumspace-downloads-v1`, quan ly trong tab "Offline" cua `/me`). Trang `/offline` la fallback khi
navigate that bai vi mat mang. Scanner offline: anh quet duoc xep hang trong IndexedDB
(`lib/offline-scan-queue.ts`) khi `navigator.onLine === false`, tu dong gui lai khi co mang tro
lai (`OfflineScanSync`, mount o root layout nen chay bat ke dang o trang nao).
`OnlineStatusBanner` hien ro trang thai ngoai tuyen (FR-PWA-003).

**Hardening**:
- **EXIF stripping**: moi anh Scanner upload duoc ma hoa lai qua `sharp` (`rotate()` truoc khi bo
  metadata) — da xac minh bang anh test co GPS/EXIF that: anh luu tren MinIO khong con EXIF.
- **Rate limiting**: `@nestjs/throttler`, mac dinh 120 req/phut/IP toan cuc, rieng
  login/register/scanner upload/contribution submit gioi han 5-10 req/phut, join competition
  20 req/phut — da xac minh tra `429` khi vuot nguong.
  In-memory (1 instance qua Docker Compose, dung cho MVP; chuyen Redis-backed khi scale GD2).
- **CORS allowlist**: `WEB_BASE_URL` trong `.env` thay cho wildcard truoc day.
- Auth dung JWT Bearer header (khong phai session cookie) nen khong co "ambient credential" —
  khong can CSRF token, day la ly do kien truc tu M1 chu khong phai thieu sot.

### Dien tap demo & Nghiem thu (Milestone M7)

Chay toan bo kich ban demo 7 buoc (muc 17.2 tai lieu goc) end-to-end tren build that voi tai
khoan moi tao hoan toan — khong mock o buoc cuoi: dang ky → onboarding → Map/Place Detail → Quiz
→ Handbook → gui dong gop co consent → Admin duyet → **noi dung xuat hien lai that trong
Handbook** (xac nhan bang `GET /v1/handbook/terms/:resultTermId` ngay sau buoc duyet).

Dien tap phat hien va vá 2 loi that:
1. Anh hong lam Scanner tra `500` thay vi loi ro rang — buoc strip EXIF (them o M6) chua boc
   try/catch quanh `sharp().toBuffer()`. Da vá: tra `400` voi thong diep ro rang.
2. `PhumDataService.publishVersion()` truoc day khong bat buoc phai co nguon trich dan truoc khi
   cong bo — vi pham ngam nguyen tac "one knowledge core". Da vá: chan publish neu chua gan nguon
   nao (`heritage.version_sources`), tra `400`.

Da doi chieu AC-01→AC-10 (tieu chi nghiem thu cap de an), AI-AC-001→012 va Release Gate G1-G6
(Dac ta AI, muc 22-23), va chon loc kiem thu theo Phu luc D (Scanner, PhumData, Contribution,
Map, Competition, Security, Accessibility, Cultural Safety). **Bao cao day du (bang diem AC,
gate, khoang trong con lai cho GD2):**
[Bao cao Nghiem thu PhumSpace](https://claude.ai/code/artifact/9675e411-421f-49e3-914b-73da8edd5e6f).

Ket luan ngan gon: san sang cho vong demo truc tiep; **chua** dat gate "General MVP" theo nghia
chat cua Dac ta AI vi thieu golden dataset AI, analytics/observability that, va quan trong nhat —
**Gate G6 (Cultural sign-off) can nguoi that thuoc Content Reviewer Network ky duyet**, dung theo
nguyen tac cua chinh tai lieu goc: "vai tro xac minh van hoa khong nen bi thay the hoan toan boi
nhom ky thuat."

### Milestone M8 — dong no ky thuat R1, mo dau GD2 (Organization & Festival Mode)

Khi len ke hoach GD2 (Pilot Tra Vinh), ra lai SRS phat hien GD1 con thieu 2 hang muc MUST/R1
chua xay: **FR-ORG-003/004** (to chuc so huu competition + xem bao cao rieng) va **FR-FES-001/007**
(trang le hoi + noi dung dua ghe Ngo co nguon). M8 dong khoang trong nay truoc khi mo rong GD2
day du (Festival Mode day du, Organization self-service, mo rong du lieu that, migrate cloud —
xem `/home/sontan29/.claude/plans/shiny-wandering-clarke.md`).

**Organization (`iam.organizations`, `iam.organization_memberships`)** — `POST /v1/organizations`
(chi SYSTEM_ADMIN), `POST/GET /v1/organizations/:id/members`. `olympiad.competitions` co them
`organization_id` nullable; `POST /v1/olympiad/competitions` voi `organizationId` chi can nguoi
tao la Organization Manager cua chinh to chuc do — **khong doi hoi vai tro he thong rieng**, vi
Manager cua 1 chua/truong hoan toan co the la REGISTERED_USER thuong (phat hien va sua trong luc
dien tap M8 — ban dau code doi ca 2 dieu kien cung luc, chan nham Manager hop le). Bao cao
`GET /v1/olympiad/organizations/:id/report` chi Manager cua chinh to chuc do xem duoc (403 neu
khong phai, chong IDOR).

**Festival Mode toi thieu (`place.festivals`, `place.festival_occurrences`, `place.festival_events`)**
— le hoi cung la 1 heritage entity (`entity_type='EVENT'`) de dung chung nguon/publication status
voi phan con lai PhumData, dung facade `PhumDataService` giong het pattern `DiscoveryService` da
dung tu M2. Route `/festivals/:entityId` (khong dung `:slug` nhu UX doc goi y, de nhat quan voi
`/places/:entityId`).

**Du lieu seed that co nguon**: to chuc demo "Ban To chuc Le hoi Chua Ang" (gan vao competition
`DEMO01` — retrofit), le hoi **Ok Om Bok** (nguon: Cuc Du lich Quoc gia Viet Nam + Cuc Di san van
hoa, da co san trong chinh tai lieu goc), noi dung **Dua ghe Ngo** kem 3 cau hoi quiz moi. Ngay
to chuc cu the theo lich am moi nam nen dung ngay uoc luong (thang 11 duong lich) voi trang thai
`PLANNED` va ghi chu ro trong mo ta — khong bia so lieu chinh xac gia (dung nguyen tac AI Spec).

**Tai lieu ha tang cloud tham khao** (`infra/cloud/`) — anh xa Docker Compose sang Cloud
Run/Cloud SQL/Memorystore, **chua deploy that**, khong dung tai khoan cloud nao.

Da xac minh: lint/typecheck/test/build sach toan repo, rollback + tai ap dung toan bo 11
migration, seed idempotent, curl end-to-end (to chuc → them thanh vien → thang Manager → tao
competition gan to chuc → bao cao dung so lieu; festival + Dua ghe Ngo hien thi dung qua API va
web), 403/IDOR dung cho moi truong hop khong co quyen.

### Milestone M9 — Organization self-service (FR-ORG-001/002/005/006)

Moi REGISTERED_USER tu gui yeu cau tao to chuc qua `POST /v1/organizations` (trang thai
`PENDING_APPROVAL`, tu dong thanh MANAGER dau tien) — chi SYSTEM_ADMIN tao thang duoc `ACTIVE`.
To chuc `PENDING_APPROVAL` **chua** so huu duoc competition/event (kiem tra trong
`OrganizationService.isManager()`, chi coi la manager hop le khi to chuc da `ACTIVE`).

- `PATCH /v1/organizations/:id/approve` | `/reject` (SYSTEM_ADMIN, bat buoc ly do khi tu choi,
  ghi audit `ORGANIZATION_APPROVED`/`ORGANIZATION_REJECTED`) — trang web `/admin/organizations`.
- `DELETE /v1/organizations/:id/members/:userId` — Manager tu go thanh vien, **chan go Manager
  cuoi cung** de tranh to chuc mo coi khong ai quan ly duoc.
- `PATCH /v1/organizations/:id/branding` — 1 mau accent (hex), khong co logo upload, khong bao
  gio che khuat nguon/nhan xac minh cua PhumData (FR-ORG-006, COULD/R2 — giu toi gian co chu y).
- `GET /v1/olympiad/organizations/:id/export` — gop bao cao competition + danh sach thanh vien,
  ghi audit `ORGANIZATION_DATA_EXPORTED`. Dat o `OlympiadService` (khong phai
  `OrganizationService`) de tranh import 2 chieu giua 2 module — Olympiad da import Organization
  tu M8, chieu nguoc lai se tao circular dependency.

Trang web: `/organizations/new` (form tu phuc vu), `/organizations/[id]` (ho so + quan ly thanh
vien/branding/export chi hien khi API xac nhan la Manager), `/admin/organizations` (hang doi
duyet, chi SYSTEM_ADMIN).

Da xac minh curl end-to-end: to chuc PENDING → thu tao competition (403) → admin duyet → ACTIVE
→ tao competition thanh cong → them/go thanh vien → chan go Manager cuoi (400) → doi branding →
xuat du lieu → tu choi to chuc khac bat buoc ly do (400 neu thieu) → khong duyet lai duoc to
chuc da REJECTED (400). Web smoke test qua middleware xac nhan dung.

### Milestone M10 — Festival Mode day du (FR-FES-002..006)

Them 4 bang: `place.festival_facilities` (an toan/tien ich theo tung lan to chuc), `place.
boat_teams` (ho so doi ghe Ngo — chi ten/dia phuong/mau sac/cau chuyen, **khong** co truong
thanh vien ca nhan, dung FR-FES-004), `experience.follows` (theo doi Festival/BoatTeam),
`ops.notifications` (thong bao **trong ung dung**, chua co push/email/SMS vi chua co ha tang
gui that — dung tinh than "delivery log" cua FR-FES-005 la danh sach xem duoc, khong phai cong
nghe push rieng).

Module moi `NotificationModule` — `POST/DELETE /v1/notifications/follow`,
`GET /v1/notifications` (danh sach), `PATCH /v1/notifications/:id/read`. Khong co endpoint tao
notification tu do cho client — `broadcast()` chi goi noi bo tu `FestivalService` khi:
- **Doi trang thai lan to chuc** (`PATCH /v1/festivals/occurrences/:id/status`) — ghi lich su
  qua `ops.audit_events` (khong tao bang "revision" rieng, tai dung pattern Contribution/
  Moderation tu M5) va tu dong bao cho nguoi theo doi le hoi (FR-FES-003/005).
- **Thong bao khan** (`POST /v1/festivals/:entityId/broadcast`, chi Manager cua to chuc phu
  trach hoac SYSTEM_ADMIN, co `priority` va `expiresAt` — FR-FES-006).

**Loi phat hien khi dien tap va da vá**: buoc dau `updateOccurrenceStatus` broadcast nham theo
`place.festivals.id` noi bo, trong khi nut Theo doi tren web luon theo doi theo `entityId` (dinh
danh cong khai dung xuyen suot moi route/Follow) — thong bao vi vay khong bao gio den noi du
theo doi thanh cong. Da vá: chuan hoa toan bo `assertCanManageFestival()` va broadcast target
ve dung 1 khong gian dinh danh (`entityId`), xac minh lai bang curl: theo doi → doi trang thai
→ thong bao den dung nguoi theo doi.

Trang web: mo rong Festival Detail (an toan/tien ich theo nhom, nut Theo doi, doi trang thai,
form gui thong bao khan), `/festivals/boat-teams` + `/festivals/boat-teams/[id]`, tab "Thong
bao" moi trong `/me` (danh dau da doc).

### Milestone M11 — Mo rong du lieu van hoa that (GD2)

Nguyen tac bat bien giu xuyen suot: **khong bia nguon**. 3 noi dung moi:

- **2 thuc the INTANGIBLE_HERITAGE dung lai nguon da xac minh tu M8** (khong can nghien cuu
  moi): **Nghe thuat Cham rieng cha pay** (Tan Hiep, Tra Cu) va **Nghe thuat Ro-bam** — ca hai
  deu duoc chinh Cuc Di san van hoa neu dich danh trong cung 1 nguon da dung cho "Dua ghe Ngo".
- **1 dia diem that thu 4, doc lap voi cum Chua Ang**: **Chua Ong Met (Kompong)**, Phuong 1
  TP. Tra Vinh — tim va xac minh qua WebSearch/WebFetch (khong phai tu tai lieu goc), nguon rieng
  la bai viet chinh thong cua Cuc Du lich Quoc gia Viet Nam (`dantoc.vietnamtourism.gov.vn`) xac
  nhan: xay nam 642, trung tu gan nhat 2022 (hon 23 ty dong). Toa do ban do la uoc luong khu vuc
  (nguon khong cho GPS cu the) — ghi chu ro trong code, giong dung nguyen tac da ap dung cho
  3 dia diem dau tien tu M2.

Da xac minh: entity moi xuat hien dung qua `GET /v1/discovery/places` va
`GET /v1/phumdata/search`, moi entity deu co it nhat 1 nguon trich dan trong
`heritage.version_sources` (truy van SQL truc tiep xac nhan), seed idempotent chay 2 lan.

---

**Tong ket GD2 (Pilot Tra Vinh, Milestone M8-M11)**: da dong xong no ky thuat R1
(Organization/Festival toi thieu — M8), hoan thien Organization self-service (M9), Festival
Mode day du gom he thong Theo doi/Thong bao moi (M10), va mo rong du lieu van hoa that co nguon
(M11). Hạ tang cloud van o muc tai lieu tham khao (`infra/cloud/`), chua deploy that — cho den
khi co tai khoan/du an GCP that.

## Nguyen tac cot loi (bat buoc tuan thu khi code)

- **Account-required**: moi route san pham (tru Welcome/Auth/Legal) yeu cau tai khoan da xac thuc.
- **PhumData la nguon su that duy nhat**: noi dung cong khai chi lay tu entity PUBLISHED/EXPERT_REVIEWED, co `sourceIds` va `verificationLevel`.
- **Verified before viral**: khong khuech dai noi dung chua co trang thai xac minh phu hop.
- **Khong gamification o khong gian ton giao**: cam diem thuong/achievement/reward tai chua, nghi le.
- **Consent theo tung tai san du lieu**: moi contribution phai co consent scope truoc khi vao review queue.

## Release readiness

CI kiểm tra lint, typecheck, unit test, production build, migration thuận/nghịch và seed. Sau khi
build, CI khởi động đúng artifact Next.js production rồi chạy `pnpm smoke:web` để xác nhận:

- `GET /api/health` trả trạng thái của web service và không cache;
- `/welcome` render được application shell;
- route yêu cầu tài khoản như `/scan` và `/me` chuyển hướng về `/welcome` khi chưa xác thực.

Có thể smoke-test một deployment đang chạy bằng `SMOKE_BASE_URL=https://example.org pnpm smoke:web`.

### Browser E2E, accessibility và performance budget

Sau `pnpm build`, chạy `pnpm e2e`. Playwright khởi động production artifact và kiểm tra trên
mobile Chromium lẫn desktop Chromium. Bộ test bao gồm luồng public/authentication gate, axe
WCAG 2 A/AA (chặn vi phạm serious/critical) và ngân sách trang Welcome: tối đa 1.500 DOM nodes,
2,5 MB tổng transfer, 900 KB JavaScript và CLS không quá 0,1. Artifact trace/screenshot/video chỉ
được giữ khi test thất bại.

Chuẩn bị staging dùng `.env.staging.example`; mọi giá trị `REPLACE_IN_SECRET_MANAGER` phải được
inject từ secret manager của nhà cung cấp. File này không phải secret thật và CI hiện không tự
deploy staging khi chưa có tài khoản, domain và phê duyệt vận hành.
