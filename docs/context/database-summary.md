# PhumSpace — Database Summary

> Context dữ liệu cô đọng từ [Database Design & PhumData Schema](../markdown/PhumSpace_Database_Design_PhumData_Schema_v1.0.md). SRS vẫn là nguồn yêu cầu cao nhất.

## 1. Nguyên tắc dữ liệu

- PostgreSQL là system of record trong R1.
- PhumData phải provenance-first, multilingual, community-controlled và AI-ready.
- Tách **identity ổn định** của entity khỏi **content version** để audit, rollback và tái lập.
- Published version immutable; thay đổi bằng version mới.
- AI output không được ghi đè dữ liệu đã xác minh hoặc trở thành nguồn sự thật.
- Access policy, consent, rights và restriction phải được áp dụng tại tầng query/retrieval.

## 2. Database schemas

| Schema | Owner | Nội dung |
|---|---|---|
| `iam` | Identity | user, organization, role, membership, session reference |
| `heritage` | PhumData | entity, version, localized content, taxonomy, relation, source, evidence |
| `media` | Media | asset, derivative, audio, rights, consent link |
| `place` | Map/Festival | place, geometry, facility, opening hours, festival, event, team |
| `contribution` | Contribution/Moderation | submission, review, dispute, revision/takedown |
| `scanner` | AI Scanner | request, job, candidate, result, model/prompt trace |
| `journey` | Journey/Passport | journey, stop, check-in, discovery, badge, progress |
| `handbook` | Handbook | term, pronunciation, example, deck, learning progress |
| `olympiad` | Olympiad | question, competition, session, answer, score, leaderboard snapshot |
| `ops` | Platform | audit, outbox, idempotency, notification, feature flag, analytics event |

## 3. Naming và data types

| Hạng mục | Quy ước |
|---|---|
| Bảng/cột | `snake_case`, tên rõ nghĩa |
| Primary key | `uuid`; public ID không dùng auto-increment |
| Time | `timestamptz` UTC; cultural date không rõ giờ dùng `date` |
| Version | `version_no` + unique(resource_id, version); `row_version` cho optimistic lock |
| Language | BCP 47: `km`, `vi`, `en`; script ISO 15924: `Khmr`, `Latn` |
| Enum | PostgreSQL enum chỉ cho tập rất ổn định; vocabulary thay đổi dùng lookup table |
| JSONB | Payload mở rộng/snapshot/provider response sanitized; field query thường xuyên phải normalize |
| Score/points | `integer`/`bigint`/`numeric`; không dùng float cho điểm nghiệp vụ |
| Geo | PostGIS `geometry/geography(Point,4326)` + accuracy/source |
| Delete | Soft delete có chọn lọc; provenance/audit không xóa vật lý theo flow thường |

Database/migration/fixture phải dùng UTF-8 và test chữ Khmer, dấu kết hợp, zero-width space và transliteration Latin.

## 4. PhumData core

| Table/Aggregate | Vai trò | Quy tắc chính |
|---|---|---|
| `heritage.heritage_entity` | Identity bền vững | `canonical_code` unique; type/status/access/current version |
| `heritage.heritage_entity_version` | Snapshot nội dung | unique(entity, version); immutable sau publish |
| `heritage.heritage_localized_content` | Nội dung theo locale/type | unique(version, language, content_type) |
| `heritage.heritage_name` | Tên/biến thể | original + normalized; language/script/name_type |
| `heritage.heritage_identifier` | External/local identifier | unique(scheme, value) |
| `heritage.heritage_entity_category` | Taxonomy assignment | unique(entity, term, role) |
| `heritage.heritage_relation` | Quan hệ tri thức | subject-predicate-object + evidence/provenance |
| `heritage.source_resource` | Tài nguyên nguồn | type/title/creator/locator/checksum/rights |
| `heritage.evidence_assertion` | Claim-evidence mapping | field_path, claim_text, support_type, review status |
| `heritage.verification_record` | Lịch sử xác minh | reviewer, scope, method, outcome, date |
| `heritage.publication_event` | Publish/rollback history | actor, review package, version pointer |

### Publication invariants

1. DRAFT sửa được; PUBLISHED không update nội dung.
2. `current_version_id` chỉ trỏ tới version PUBLISHED được phép phục vụ.
3. Publish ghi version pointer, publication event, audit và outbox trong cùng transaction.
4. Rollback là đổi pointer về version trước + event; không xóa lịch sử.
5. Public API mặc định chỉ trả current version; admin history theo permission.

## 5. Multilingual và Khmer data

- Lưu `original_value` và `normalized_value`; không thay original bằng bản normalize.
- `name_type`: PREFERRED, ALTERNATE, HISTORICAL, LOCAL, TRANSLITERATION, TRANSLATION.
- Không suy luận script chỉ từ language.
- Một entity có thể có nhiều biến thể tên/phát âm cùng được xác minh.
- Pronunciation phải liên kết media, speaker profile/context, quality và consent.
- `dialect_region_id` mô tả phạm vi, không dùng để phán định một biến thể là đúng duy nhất.

## 6. Provenance và evidence

Mỗi claim văn hóa quan trọng cần:

- `source_resource` có metadata và rights status;
- `evidence_assertion` gắn vào entity version/field path;
- support type: SUPPORTS, CONTRADICTS hoặc CONTEXTUALIZES;
- review status và reviewer;
- citation-safe locator cho public display.

Entity version có thể publish khi thỏa policy evidence/verification theo loại nội dung; policy này cần config/vocabulary có version, không hard-code rải rác.

## 7. Media, rights và consent

| Table/Concept | Nội dung |
|---|---|
| `media.media_asset` | storage key, SHA-256, MIME, access level, retention |
| derivative | resize/transcode/thumbnail/audio variant |
| rights record | owner/license/attribution/expiry/restriction |
| consent record/version | subject, scope JSON, granted/withdrawn time, evidence document |
| consent link | liên kết consent với asset/contribution/entity/source |

Quy tắc:

- Object private mặc định; public delivery qua derivative/CDN policy.
- Consent scope phải machine-readable cho publish, attribution, commercial use và AI use.
- Withdrawal không xóa audit cần thiết nhưng phải ngăn public access/retrieval theo SLA.
- Không sử dụng contribution/evaluation media ngoài scope đã đồng ý.

## 8. Contribution và moderation

Các aggregate chính:

- Contribution/Submission + immutable payload snapshots.
- ReviewAssignment/ReviewDecision.
- RightsReview/ExpertReview.
- RevisionRequest/Dispute/TakedownRequest.
- Publication linkage tới entity/version/source/media.

Baseline state:

```text
DRAFT → SUBMITTED → TRIAGE
  → CHANGES_REQUESTED → SUBMITTED
  → EXPERT_REVIEW / RIGHTS_REVIEW
  → APPROVED → PUBLISHED
  → REJECTED / WITHDRAWN
```

## 9. Scanner data model

| Table/field | Ý nghĩa |
|---|---|
| `scan_request` | actor/session, locale, place context, uploaded asset reference |
| `scan_job` | queue lifecycle, idempotency, attempt, model/prompt/index/schema version |
| `scan_candidate` | entity version, retrieval/visual/location scores, rank |
| `scan_result` | decision, confidence band, structured output, citation references |
| `scan_feedback` | user selection/correction/report |
| model trace reference | provider request ID, token/cost, redacted trace metadata |

Decision: MATCH, SUGGEST, UNKNOWN, HUMAN_REVIEW. Trace phải đủ để tái lập nhưng không lưu secret/restricted context thừa.

## 10. Journey, Passport, Handbook và Olympiad

- Journey: journey, version, stop, place/entity link, order, duration.
- Check-in: method, server time, geo/QR evidence, validity result.
- Passport: discovery/saved item/progress/badge/XP ledger; privacy private mặc định.
- Handbook: term, localized meaning, script/transliteration, pronunciation, example, relation, progress.
- Olympiad: question version, competition, participant/session, answer submission, score event, leaderboard snapshot.
- `answer_submission.idempotency_key` unique theo session/participant.
- `server_received_at` là thời gian authoritative.
- Score event append-only; leaderboard là projection, không phải nguồn điểm duy nhất.

## 11. Ops tables

- `ops.audit_event`: actor, action, target, correlation ID, before/after hash/safe metadata.
- `ops.outbox_event`: event type/version/payload, publish attempt, published time.
- `ops.idempotency_record`: scope/key/request hash/result reference/expiry.
- notification delivery, feature flag, analytics event với data minimization.

## 12. Index và query policy

- Unique/index cho canonical code, version, preferred name và idempotency keys.
- Trigram/full-text cho normalized multilingual search.
- GIN cho JSONB chỉ khi query pattern rõ.
- GiST/SP-GiST cho PostGIS nearby.
- Partial index cho PUBLISHED/PUBLIC/current data.
- Vector index chỉ bật sau khi Phase 1 search có baseline và evaluation chứng minh lợi ích.
- Access/restriction filter chạy trước ranking/render; không chỉ lọc ở UI.

## 13. Baseline controlled values

| Nhóm | Giá trị |
|---|---|
| Access level | PUBLIC, EDUCATIONAL, RESEARCH, COMMUNITY_ONLY, RESTRICTED |
| Publication | DRAFT, IN_REVIEW, APPROVED, PUBLISHED, SUPERSEDED, WITHDRAWN |
| Verification | UNVERIFIED, COMMUNITY_CONFIRMED, SOURCE_VERIFIED, EXPERT_REVIEWED |
| Evidence support | SUPPORTS, CONTRADICTS, CONTEXTUALIZES |
| Scan decision | MATCH, SUGGEST, UNKNOWN, HUMAN_REVIEW |
| Media type | IMAGE, AUDIO, VIDEO, DOCUMENT, TRANSCRIPT, OTHER |
| Source type | BOOK, ARTICLE, ARCHIVE, INTERVIEW, FIELD_NOTE, PHOTO, AUDIO, VIDEO, WEBSITE, DATASET |

## 14. Việc phải chốt trước migration/code

- ORM/query builder và hỗ trợ PostgreSQL schemas.
- UUID strategy và idempotency format.
- PostGIS trong local/staging/prod.
- Controlled vocabulary seed v1.
- Retention cho scan image, AI trace và analytics.
- Rights/consent form + allowed-use fields.
- Publish quorum theo content type.
- Search Phase 1 và gate bật vector Phase 2.
- Migration CI + database integration tests.
