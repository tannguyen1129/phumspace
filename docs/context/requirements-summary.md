# PhumSpace — Requirements Summary

> Bản cô đọng phục vụ lập backlog và coding. Nguồn có hiệu lực cao nhất: [PhumSpace SRS v1.0](../markdown/PhumSpace_SRS_v1.0.md). Luồng và trạng thái UI: [UX Flow & Wireframe](../markdown/PhumSpace_UX_Flow_Wireframe_v1.0.md).

## 1. Thứ tự ưu tiên tài liệu

1. SRS v1.0 — yêu cầu nghiệp vụ/phần mềm và tiêu chí nghiệm thu.
2. UX Flow & Wireframe — hành trình, màn hình và trạng thái giao diện.
3. System Design Document — kiến trúc triển khai.
4. Database Design & PhumData Schema — thiết kế dữ liệu chi tiết.
5. AI Specification — contract và policy AI.

Mâu thuẫn với SRS phải được xử lý bằng Change Request trước khi code.

## 2. Actor và role R1

- Guest
- User
- Contributor
- Reviewer
- Organization Manager
- Content Admin
- System Admin

Quy tắc: API phải kiểm tra quyền phía server; hành động quản trị/nhạy cảm ghi audit. Reviewer/Admin phải hỗ trợ MFA khi production policy bật.

## 3. Use case trọng yếu

| ID | Use case | Kết quả thành công |
|---|---|---|
| UC-01 | Quét và khám phá đối tượng văn hóa | Kết quả grounded, có nguồn, verification label và next action |
| UC-02 | Tạo/thực hiện hành trình di sản | Xem stop, bắt đầu/resume, check-in hợp lệ, cập nhật passport |
| UC-03 | Tham gia quiz/cuộc thi | Join, nhận câu hỏi, submit idempotent, server chấm và cập nhật rank |
| UC-04 | Đóng góp audio/câu chuyện | Media + metadata + consent được submit và theo dõi trạng thái |
| UC-05 | Review và công bố dữ liệu | Review evidence/rights, yêu cầu sửa hoặc publish version mới |
| UC-06 | Vận hành Olympiad | Tạo competition, join code, timer, realtime state, export kết quả |

## 4. Functional requirements theo domain

### 4.1 Public discovery

- Mobile-first homepage có lối vào Scan, Map, Journey, Handbook, Quiz/Olympiad và Contribution.
- Guest xem nội dung PUBLIC không cần đăng nhập.
- Search theo tên Việt, Khmer, phiên âm, tên địa phương, category và keyword; hỗ trợ tiếng Việt không dấu.
- Entity detail hiển thị tên, localized content, media, source, verification, place và nội dung liên quan theo access policy.
- URL ổn định, deep link và metadata chia sẻ.
- Hỗ trợ chế độ đọc ngắn, đọc sâu và audio/transcript.
- Có flow báo sai/yêu cầu xem xét mà không công khai người báo.

### 4.2 Identity & access

- Email registration/login, email verification, password reset một lần có TTL.
- Refresh/session rotation, revoke session, rate limit/temporary lock khi đăng nhập thất bại.
- Guest data có thể merge vào account một lần, tránh duplicate.
- Role-based authorization; production admin/reviewer hỗ trợ MFA.
- User có thể export dữ liệu cá nhân và yêu cầu xóa/khóa account theo retention policy.
- Disable account không được phá attribution/audit đã công bố.

### 4.3 Phum Passport

- Một passport hoạt động cho mỗi user.
- Lưu scan, check-in, quiz, saved term/content, badge và contribution theo privacy setting.
- Bookmark/unbookmark phải idempotent và đồng bộ đa thiết bị.
- Badge rule có version; không cấp trùng cùng rule/version; ghi lý do cấp.
- Passport private mặc định; chia sẻ thành tích là opt-in.

### 4.4 PhumData

- CRUD entity, version, localized content, names, taxonomy, relations, sources, evidence và media theo quyền.
- Published version immutable; sửa nội dung bằng version mới.
- Public API chỉ đọc current published version được phép truy cập.
- Mọi claim quan trọng phải gắn evidence/source; hiển thị provenance và verification.
- Search/index phải rebuild khi publication version thay đổi.
- Restricted/withdrawn content phải bị loại trước ranking/rendering.

### 4.5 AI Cultural Scanner

- Nhận upload hợp lệ, sanitize, xóa EXIF không cần thiết và tạo job idempotent.
- Pipeline bất đồng bộ; UI theo dõi trạng thái job.
- Candidate chỉ lấy từ entity version đã publish và caller được phép xem.
- Output structured, schema-valid, citation-grounded.
- Decision hợp lệ: MATCH, SUGGEST, UNKNOWN, HUMAN_REVIEW.
- Borderline trả tối đa 3 candidate; low/no match trả UNKNOWN, không bịa tên/nguồn.
- User có thể chọn candidate khác, báo sai hoặc bổ sung context.

### 4.6 Map & Journey

- List/map view, filters, nearby và place detail.
- Journey có stop, thứ tự, estimated duration và khả năng resume.
- Check-in theo QR/radius policy được cấu hình; server xác nhận.
- Mở external navigation; không tự nhận trách nhiệm route safety khi thiếu dữ liệu bản đồ.
- Offline hỗ trợ tuyến/nội dung đã tải; sync khi online.

### 4.7 Handbook

- Term, Khmer script, transliteration, localized meaning, pronunciation audio, example và related entity.
- Save term, learning progress, flashcard/quiz.
- Nhiều cách phát âm/biến thể có thể tồn tại song song với context và consent.

### 4.8 Quiz & Olympiad

- Question bank có version, source/evidence và review status.
- Join code/session; server-authoritative timer, answer acceptance và scoring.
- Submission idempotent; lưu `server_received_at`.
- Reconnect/resume không tạo duplicate answer.
- Leaderboard là read model/snapshot; điểm nghiệp vụ không chỉ tồn tại trong Redis.

### 4.9 Contribution, consent, moderation

- Contribution có draft, media, metadata, source context và consent version.
- Consent nêu rõ lưu trữ, công bố, attribution, commercial use và AI use; không dùng scope ngoài điều đã chấp thuận.
- Reviewer có thể request changes, approve, reject hoặc route rights/expert review.
- Publish phải atomic với publication event và outbox event.
- Có dispute, correction và takedown; consent withdrawal kích hoạt invalidation.

### 4.10 Admin, notification, analytics

- Admin CRUD catalog, media/source, queue review, publish, event/competition và role theo quyền.
- Notification qua queue, tôn trọng user preference và có retry/dead-letter.
- Analytics không được thu thập PII thừa; hành động đặc quyền có audit trail.

## 5. Yêu cầu phi chức năng quan trọng

| Nhóm | Baseline |
|---|---|
| Hiệu năng | P95 API thường <500 ms; P95 scan end-to-end <12 giây trong điều kiện thử nghiệm |
| Availability | Uptime pilot ≥99,5%; graceful degradation khi provider ngoài lỗi |
| Scale | Kiểm thử tối thiểu 500 concurrent participants và 50 submissions/giây |
| Security | TLS, least privilege, secret management, server-side authorization, rate limit, audit |
| Privacy | Data minimization, consent, access level, retention, export/delete request |
| Accessibility | WCAG-oriented contrast, keyboard focus, touch target, alt text, transcript, reduced motion |
| Compatibility | Mobile-first PWA; camera/permission/error states; danh sách browser/device phải được chốt |
| Maintainability | Typed contracts, lint/type-check, unit/integration/e2e, migration CI, observability |
| Correctness | Server authoritative cho competition; PhumData published là source of truth |

## 6. Trạng thái và lỗi phải thiết kế ngay từ đầu

- Loading, empty, partial data, stale cache, offline, retrying, permission denied, unauthenticated, forbidden.
- Scan: UPLOADING, QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED/EXPIRED theo contract chi tiết.
- Contribution: DRAFT, SUBMITTED, TRIAGE, CHANGES_REQUESTED, EXPERT_REVIEW, RIGHTS_REVIEW, APPROVED, PUBLISHED, REJECTED, WITHDRAWN.
- Publication: DRAFT, IN_REVIEW, APPROVED, PUBLISHED, SUPERSEDED, WITHDRAWN.
- API error phải có stable code, HTTP status, request/correlation ID và safe user message.
- Retry chỉ cho lỗi transient; không retry validation, policy hoặc permission error.

## 7. Definition of Done tối thiểu

- Requirement ID được link tới issue/story, API, test và tài liệu liên quan.
- Unit/domain policy tests pass; integration tests cho DB/Redis/provider adapter khi liên quan.
- Authorization, access policy, audit và privacy cases được test.
- UI có đủ loading/error/offline/empty states.
- Migration backward-compatible hoặc có kế hoạch rollout.
- Observability có log/metric/trace cần thiết; không log secret/restricted context.
- Acceptance criteria của requirement và end-to-end R1 scenario pass.

## 8. Các quyết định chưa chốt trước triển khai

| ID | Cần chốt |
|---|---|
| DEC-001 | Identity provider/self-managed auth |
| DEC-002 | Object storage và malware scanning provider |
| DEC-003 | Scanner confidence threshold/calibration |
| DEC-004 | Controlled vocabulary/category seed và owner phê duyệt |
| DEC-005 | Consent form pháp lý và scope AI/commercial use |
| DEC-006 | Check-in radius/QR policy |
| DEC-007 | Competition load target chính thức |
| DEC-008 | Retention cụ thể theo loại dữ liệu |
| DEC-009 | Browser/device support matrix |
| DEC-010 | Moderation/takedown SLA và escalation contacts |
