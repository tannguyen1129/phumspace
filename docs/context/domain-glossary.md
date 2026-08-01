# PhumSpace — Domain Glossary

> Thuật ngữ dùng chung cho Product, UX, Frontend, Backend, Data/AI, QA và Cultural Review. Nguồn: [SRS](../markdown/PhumSpace_SRS_v1.0.md), [Database Design](../markdown/PhumSpace_Database_Design_PhumData_Schema_v1.0.md), [AI Specification](../markdown/PhumSpace_AI_Specification_v1.0.md) và [UX Flow](../markdown/PhumSpace_UX_Flow_Wireframe_v1.0.md).

## A. Sản phẩm và trải nghiệm

| Thuật ngữ | Định nghĩa dùng trong dự án |
|---|---|
| PhumSpace | Nền tảng dữ liệu và trải nghiệm số văn hóa Khmer Nam Bộ, khởi tạo tại Trà Vinh |
| PhumData | Kho tri thức số có entity, relation, source, evidence, rights, consent và lịch sử xác minh |
| Heritage Entity | Identity ổn định của một khái niệm/hiện vật/thực hành/lễ hội/địa điểm/tác phẩm hoặc chủ thể văn hóa được quản trị |
| Entity Version | Snapshot nội dung của một Heritage Entity; published version là immutable |
| Phum Passport | Hồ sơ hành trình cá nhân gồm scan, check-in, saved item, term, quiz, badge và contribution |
| AI Cultural Scanner | Luồng quét ảnh/QR, quan sát, truy xuất candidate và trả nội dung grounded từ PhumData |
| Heritage & Festival Map | Trải nghiệm danh sách/bản đồ địa điểm, lễ hội, nearby, filter, journey và check-in |
| Journey | Tuyến trải nghiệm có version và danh sách stop có thứ tự |
| Journey Stop | Một điểm trong journey, thường liên kết place/entity và yêu cầu khám phá/check-in |
| Festival Mode | Chế độ trải nghiệm theo lễ hội, lịch, địa điểm, hoạt động/đội và thông báo |
| Khmer Handbook | Sổ tay tương tác chứa term, chữ Khmer, transliteration, pronunciation, meaning, example và learning progress |
| Olympiad | Hệ thống quiz cá nhân và cuộc thi văn hóa số theo thời gian thực |
| Competition | Một phiên cuộc thi có lifecycle, join code, questions, server timer, scoring và leaderboard |
| Badge/Achievement | Thành tích được cấp theo rule có version và lý do cấp |
| XP Ledger | Sổ điểm append-only cho hoạt động gamification, không chỉ lưu tổng cuối |
| Bookmark/Saved Item | Liên kết user với entity/place/journey/term đã lưu; thao tác idempotent |

## B. Dữ liệu và tri thức

| Thuật ngữ | Định nghĩa dùng trong dự án |
|---|---|
| Provenance | Thông tin nguồn gốc của dữ liệu/claim: nguồn, contributor, reviewer, phương pháp, thời điểm và version |
| Source Resource | Sách, bài nghiên cứu, archive, interview, field note, media, website hoặc dataset dùng làm nguồn |
| Evidence Assertion | Bản ghi cho biết một source hỗ trợ, mâu thuẫn hoặc cung cấp context cho một claim/field |
| Claim | Một phát biểu cụ thể về entity mà hệ thống có thể kiểm chứng và gắn citation |
| Citation | Tham chiếu public-safe tới source/evidence được phép hiển thị |
| Verification Level | Mức xác minh của content/version; tách biệt với publication status |
| Publication Status | Trạng thái workflow của content/version: draft, review, approved, published, superseded, withdrawn |
| Access Level | Phạm vi truy cập: PUBLIC, EDUCATIONAL, RESEARCH, COMMUNITY_ONLY hoặc RESTRICTED |
| Taxonomy | Hệ thống category/term có quản trị dùng để phân loại entity và content |
| Controlled Vocabulary | Tập giá trị có owner/version; dùng khi enum có thể thay đổi theo nghiệp vụ/văn hóa |
| Heritage Relation | Quan hệ subject-predicate-object giữa entities, có provenance/evidence |
| Localized Content | Nội dung theo language/locale/content type, có review status riêng |
| Preferred Name | Tên ưu tiên trong một scope language/script; không phủ định các alternate/local variants |
| Transliteration | Phiên âm từ chữ Khmer sang hệ chữ Latin; không đồng nghĩa translation |
| Dialect/Regional Variant | Biến thể tên/phát âm/nội dung theo địa bàn; có thể tồn tại song song |
| Current Version | Published entity version hiện được public API phục vụ |
| Immutable Published Version | Published version không được update nội dung; sửa bằng version mới |
| Publication Event | Sự kiện ghi lại publish/rollback, actor, review package và pointer version |

## C. Cộng đồng, quyền và kiểm duyệt

| Thuật ngữ | Định nghĩa dùng trong dự án |
|---|---|
| Contribution | Tư liệu hoặc đề xuất dữ liệu do cộng đồng/user gửi lên |
| Contributor | User có quyền tạo và theo dõi contribution |
| Consent | Bằng chứng đồng ý về lưu trữ, công bố, attribution, commercial use và AI use theo scope cụ thể |
| Consent Version | Bản consent immutable tại thời điểm chấp thuận; thay đổi bằng version mới |
| Consent Withdrawal | Hành động rút lại consent, kích hoạt restriction/invalidation theo policy và SLA |
| Rights Status | Tình trạng quyền/licence của source/media; độc lập với technical access level |
| Attribution | Cách ghi công cá nhân/tổ chức theo consent và rights |
| Reviewer | Người có quyền đánh giá evidence, văn hóa, quyền và phạm vi công bố |
| Cultural Reviewer | Reviewer chịu trách nhiệm về tính đúng, tôn trọng, biến thể và sensitivity |
| Moderation | Workflow triage, request changes, expert/rights review, approve/reject và publish |
| Review Assignment | Nhiệm vụ review được giao cho reviewer/scope |
| Review Decision | Kết luận có lý do: changes requested, approved, rejected, restricted... |
| Dispute | Yêu cầu tranh luận/xem xét lại quyết định hoặc nội dung đã công bố |
| Takedown | Yêu cầu gỡ/hạn chế nội dung/media vì quyền, consent, safety hoặc sai lệch |
| Sensitivity | Thuộc tính cho biết nội dung nghi lễ/tri thức/địa điểm cần hạn chế hoặc review đặc biệt |

## D. AI và retrieval

| Thuật ngữ | Định nghĩa dùng trong dự án |
|---|---|
| Observation | Mô tả đặc điểm nhìn thấy trong ảnh, chưa phải claim lịch sử/văn hóa |
| Candidate | Entity version do retrieval trả về để model so sánh; phải published và permitted |
| Retrieval | Quá trình tìm candidate/source bằng text, taxonomy, location và index đã đánh giá |
| Reranking | Sắp xếp candidate dựa trên retrieval, visual alignment, location, quality và evidence coverage |
| Controlled RAG | Retrieval-Augmented Generation chỉ dùng evidence bundle được policy cho phép |
| Evidence Bundle | Context có version gồm entity, approved claims, citations, verification và allowed scope |
| Grounded Synthesis | Sinh câu trả lời chỉ từ evidence bundle, theo schema và citation policy |
| Structured Output | JSON theo schema được model sinh và application validate lại |
| Citation Coverage | Tỷ lệ claim bắt buộc có citation hợp lệ |
| Unsupported Claim | Claim không được evidence bundle hỗ trợ |
| Confidence Band | Nhãn dễ hiểu LOW/MEDIUM/HIGH; không phải xác suất chân lý |
| MATCH | Một candidate đủ điều kiện cao, margin/evidence/policy đạt |
| SUGGEST | Có 2–3 candidate hợp lý nhưng chưa đủ chắc chắn |
| UNKNOWN | Không đủ candidate/evidence; hệ thống chủ động không khẳng định |
| HUMAN_REVIEW | Kết quả cần người xem do sensitivity, conflict, missing evidence hoặc user report |
| Golden Dataset | Bộ evaluation có rights, label, reviewer và slice metadata dùng cho regression/calibration |
| False Confident Rate | Tỷ lệ kết quả sai nhưng hệ thống trả MATCH/HIGH; metric safety quan trọng |
| Prompt Registry | Kho prompt versioned có owner, checksum, status và schema version |
| Model Alias | Tên cấu hình ổn định như `vision_fast`; không hard-code provider model name trong domain code |
| Index Version | Phiên bản search/embedding index dùng để tái lập một kết quả AI |
| Threshold Version | Phiên bản weights/thresholds của decision engine |

## E. Kiến trúc và vận hành

| Thuật ngữ | Định nghĩa dùng trong dự án |
|---|---|
| Modular Monolith | Một codebase/deployment có modules với ownership/dependency boundary rõ; có thể tách sau |
| Application Facade | Interface công khai của module để module khác gọi use case, thay vì import repository |
| Shared Kernel | Primitive/khái niệm rất ổn định dùng chung giữa modules |
| Domain Event | Sự kiện nghiệp vụ đã xảy ra, được version hóa |
| Outbox Pattern | Ghi domain change và event vào DB transaction, sau đó dispatcher publish đáng tin cậy |
| Idempotency Key | Khóa giúp retry request/job/submission mà không tạo hiệu ứng trùng |
| Read Model | Projection tối ưu cho query/realtime UI, có thể rebuild từ system of record |
| System of Record | Nguồn dữ liệu bền vững có thẩm quyền; trong R1 là PostgreSQL/PhumData, không phải Redis/AI |
| Correlation ID | ID liên kết request, job, event, log và audit xuyên hệ thống |
| Circuit Breaker | Cơ chế dừng gọi provider tạm thời khi lỗi vượt ngưỡng |
| Dead-letter Queue | Nơi giữ job/event thất bại sau retry để điều tra/xử lý |
| Signed URL | URL tạm thời cho upload/download object private |
| Derivative | Bản media đã resize/transcode/thumbnail phục vụ hiệu năng và quyền |
| PWA App Shell | HTML/CSS/JS nền có thể cache để app mở khi mạng yếu/offline |
| Server-authoritative | Server quyết định timer, answer acceptance, score và trạng thái competition |
| Feature Flag | Cấu hình bật/tắt/ramp một tính năng hoặc model/prompt version |
| Release Gate | Điều kiện contract, data, quality, safety, operations và cultural sign-off trước release |
| SLO | Mục tiêu dịch vụ có thể đo, ví dụ latency/availability/job age |

## F. Trạng thái baseline

### Publication

`DRAFT → IN_REVIEW → APPROVED → PUBLISHED → SUPERSEDED/WITHDRAWN`

### Contribution

`DRAFT → SUBMITTED → TRIAGE → CHANGES_REQUESTED / EXPERT_REVIEW / RIGHTS_REVIEW → APPROVED → PUBLISHED`, hoặc `REJECTED/WITHDRAWN`.

### Scanner decision

`MATCH | SUGGEST | UNKNOWN | HUMAN_REVIEW`

### Evidence support

`SUPPORTS | CONTRADICTS | CONTEXTUALIZES`
