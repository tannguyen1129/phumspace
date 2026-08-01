# PhumSpace — Architecture Decisions

> Baseline triển khai cô đọng từ [System Design Document](../markdown/PhumSpace_System_Design_Document_v1.0.md), đối chiếu với [SRS](../markdown/PhumSpace_SRS_v1.0.md).

## 1. Kiến trúc baseline

MVP dùng **modular monolith**, không dùng microservices bắt buộc. API và worker có thể chạy thành process/container riêng nhưng dùng chung domain model và PostgreSQL. Module boundaries phải đủ rõ để có thể tách dịch vụ khi tải/đội vận hành thực sự yêu cầu.

## 2. Stack

| Lớp | Công nghệ baseline |
|---|---|
| Web | Next.js + TypeScript, PWA, Admin Portal |
| API | NestJS + TypeScript, REST/OpenAPI v1 |
| Realtime | NestJS WebSocket Gateway; Redis pub/sub khi scale nhiều instance |
| Background jobs | NestJS worker + BullMQ |
| Database | PostgreSQL; JSONB; full-text/trigram; PostGIS; vector chỉ khi có evaluation |
| Ephemeral/cache | Redis |
| Media | Private object storage + signed URL + derivatives/lifecycle |
| AI/Maps/TTS | Provider adapter; baseline Google Gemini, Maps Platform và Cloud TTS |
| Runtime | Docker; Google Cloud reference: Cloud Run, Cloud SQL, Memorystore, Storage |
| Observability | Structured logs, metrics, traces, alerting và audit |

## 3. ADR baseline

| ADR | Quyết định | Baseline |
|---|---|---|
| ADR-001 | Modular monolith | NestJS modules + shared DB; worker tách process |
| ADR-002 | REST-first | OpenAPI v1; WebSocket chỉ cho realtime |
| ADR-003 | PostgreSQL system of record | Relational + JSONB + full-text/vector option |
| ADR-004 | Redis cho ephemeral state | Cache, BullMQ, rate limit, pub/sub; không giữ dữ liệu nghiệp vụ duy nhất |
| ADR-005 | Object storage cho media | Private bucket, signed URL, derivative; không lưu blob lớn trong DB |
| ADR-006 | Scanner bất đồng bộ | Create job → worker → result event |
| ADR-007 | Provider-agnostic core | Adapter cho Gemini/Maps/TTS/Storage |
| ADR-008 | Google Cloud reference | Cloud Run, Cloud SQL, Memorystore, Storage |

## 4. Container responsibilities

| Container | Trách nhiệm |
|---|---|
| `web` | SSR/CSR, routes, service worker, UI; không giữ backend secret |
| `api` | REST, authn/authz, transaction, WebSocket gateway, enqueue jobs |
| `worker` | AI/media/TTS/export/notification; idempotent consumers |
| `postgres` | System of record, constraints, versions, audit references và search metadata |
| `redis` | Cache, queue, rate limit, session/realtime state có TTL |
| `object` | Original/derivative media, private access, signed URLs và lifecycle |
| `observability` | Logs, metrics, traces, alerts, dashboard |

## 5. Backend layering

```text
Interface       Controller, Gateway, DTO, serializer
Application     Use cases, transaction boundary, orchestration
Domain          Entity, value object, policy, domain event
Infrastructure  Repository, ORM mapping, external adapters
```

Quy tắc bắt buộc:

- Interface không truy cập DB trực tiếp.
- Domain không phụ thuộc NestJS/ORM/provider SDK.
- Module khác chỉ gọi application facade hoặc consume event; không import repository nội bộ.
- Shared Kernel chỉ chứa primitive/khái niệm ổn định.
- Không dùng `forwardRef` để che circular dependency; phải sửa boundary.
- Cross-module transaction chỉ dùng khi cần consistency tức thời; còn lại dùng outbox/domain event.

## 6. Module boundaries

| Module | Owned aggregates |
|---|---|
| Identity & Access | User, profile, role, permission, organization membership |
| PhumData Catalog | HeritageEntity, Version, Name, Relation, Source, Evidence, publication |
| Media | MediaAsset, derivative, rights metadata, retention |
| AI Scanner | Scan, Job, Candidate, Result, Feedback, model trace |
| Map & Journey | Place, Festival, Journey, Stop, Check-in |
| Handbook | Term, pronunciation, example, deck, learning progress |
| Quiz & Olympiad | Question, Competition, Session, Answer, Score, Leaderboard |
| Passport | Achievement, XP ledger, saved/discovered items |
| Contribution & Consent | Contribution, submission media, ConsentVersion, TakedownRequest |
| Moderation & Publication | ReviewAssignment, Decision, Dispute, Publication workflow |
| Organization & Event | Organization, event, invitation, participants |
| Notification | Template, preference, delivery |
| Analytics & Audit | ProductEvent, AuditRecord, ReportExport |

## 7. Data ownership

- Một PostgreSQL cluster cho R1.
- Module sở hữu schema/table của mình; cross-module read qua application service hoặc read model.
- Public IDs dùng UUID/ULID; timestamps lưu UTC.
- Published/consent/audit history dùng immutable version hoặc append-only pattern.
- Redis không phải system of record.
- Search result phải lọc access/restriction trước ranking và render.

## 8. Giao tiếp đồng bộ và bất đồng bộ

- REST cho CRUD/query/use cases thông thường.
- WebSocket cho competition state, timer, answer acknowledgement và leaderboard updates.
- BullMQ cho AI, media processing, TTS, export và notification.
- Outbox pattern cho domain event cần giao đáng tin cậy.
- Consumer phải idempotent; event envelope có event ID, type/version, occurredAt, correlation/causation IDs và payload.

## 9. AI Scanner flow

```text
POST scan request
  → signed/private upload
  → sanitize/remove EXIF
  → enqueue job
  → vision observation
  → retrieval + policy filter
  → rerank candidates
  → evidence bundle
  → grounded synthesis
  → schema/semantic validation
  → decision MATCH | SUGGEST | UNKNOWN | HUMAN_REVIEW
  → persist result + trace versions
  → publish completion event
```

Provider timeout/error dùng bounded retry, backoff, circuit breaker và fallback an toàn. Không tự chuyển provider/model chưa qua evaluation.

## 10. Olympiad correctness model

- Server là nguồn thời gian và quyết định answer acceptance/scoring.
- Submission có idempotency key và `server_received_at`.
- Score lưu dưới dạng event/transaction bền vững; leaderboard là read model/cache.
- Reconnect phải resume từ server snapshot, không tin client timer/state.
- Multi-instance gateway dùng Redis pub/sub; không giả định sticky session tuyệt đối.

## 11. PWA và caching

- Cache app shell và static assets theo version.
- Cache public content có kiểm soát theo entity version/locale.
- Không cache restricted/private response trong public cache.
- Offline queue chỉ chứa hành động được phép retry; phải hiển thị trạng thái sync rõ.
- Signed URL có TTL; media derivative theo bandwidth/device.
- Scan AI cần mạng; có thể lưu local pending upload theo UX/privacy policy.

## 12. Security & privacy

- Authn/authz server-side, least privilege, MFA policy cho admin/reviewer.
- Secrets qua secret manager/environment injection; validate config lúc startup.
- Signed upload, MIME/content validation, malware scanning decision và size limits.
- Consent/access/retention là domain data, không chỉ là UI copy.
- Audit hành động đặc quyền; log không chứa secret, raw restricted context hoặc PII không cần thiết.
- Data withdrawal/restriction phát event để invalidate search index, cache và AI retrieval.

## 13. Monorepo đề xuất

```text
phumspace/
├── apps/
│   ├── web/          # Next.js PWA + Admin
│   ├── api/          # NestJS HTTP + WebSocket
│   └── worker/       # NestJS worker / BullMQ
├── packages/
│   ├── contracts/    # OpenAPI-generated types / JSON schemas
│   ├── ui/           # Design system
│   ├── config/       # eslint, tsconfig, env schemas
│   └── testing/      # fixtures, mocks, test utilities
├── infra/
│   ├── docker/
│   └── terraform/
└── docs/
    ├── adr/
    ├── openapi/
    └── runbooks/
```

## 14. CI/CD gates

1. Locked install, lint, type-check.
2. Unit/domain policy tests.
3. Integration tests với ephemeral PostgreSQL/Redis.
4. Container build + dependency/image/security scan.
5. Migration validation và backward compatibility.
6. Deploy development/staging + smoke/e2e.
7. Production approval, canary/gradual traffic và post-deploy checks.

## 15. Scaling path

- Scale web/api/worker độc lập.
- Worker autoscale theo queue depth/job age.
- Connection pooling cho PostgreSQL.
- Cache/read model cho hot public reads và leaderboard.
- Chỉ tách service khi có bằng chứng về tải, ownership hoặc deployment cadence; ưu tiên Scanner/Olympiad/Media là ứng viên đầu tiên.
