# PhumSpace — Product Context

> Context triển khai cô đọng. Nguồn đầy đủ: [Tài liệu mô tả dự án](../markdown/PhumSpace_Project_Description_v1.0.md), [SRS](../markdown/PhumSpace_SRS_v1.0.md), [UX Flow & Wireframe](../markdown/PhumSpace_UX_Flow_Wireframe_v1.0.md).

## 1. Định vị sản phẩm

**PhumSpace** là nền tảng dữ liệu và trải nghiệm số về văn hóa Khmer Nam Bộ, khởi tạo tại Trà Vinh. Sản phẩm kết nối kho tri thức **PhumData** với AI đa phương thức, bản đồ hành trình, giáo dục tương tác và quy trình cộng đồng đóng góp — kiểm duyệt — công bố.

Tuyên bố định vị: PhumSpace không chỉ số hóa di sản thành dữ liệu; nền tảng biến dữ liệu đó thành một hành trình sống, nơi cộng đồng Khmer giữ quyền kể câu chuyện của chính mình.

## 2. Bài toán cần giải quyết

- Tư liệu văn hóa đang phân tán trong sách, nghiên cứu, kho địa phương, video, audio và ký ức truyền khẩu; thiếu cấu trúc dùng chung.
- Du khách và người trẻ khó tiếp cận nội dung sâu, có nguồn và phù hợp ngữ cảnh tại điểm đến.
- AI có thể tạo thông tin sai hoặc đơn giản hóa quá mức nếu không bị ràng buộc bởi dữ liệu đã xác minh.
- Người bản địa, nghệ nhân và chuyên gia thiếu một workflow số để đóng góp, kiểm soát quyền và yêu cầu sửa/gỡ.
- Trường học và tổ chức thiếu công cụ kết hợp hành trình, quiz, sự kiện và dữ liệu văn hóa trong cùng nền tảng.

## 3. Nguyên tắc sản phẩm bất biến

1. **PhumData là nguồn sự thật ứng dụng.** AI chỉ quan sát, truy xuất và diễn giải.
2. **Cộng đồng Khmer là chủ thể dữ liệu.** Consent, attribution, phạm vi công bố và quyền sửa/gỡ phải được thể hiện trong workflow.
3. **Provenance-first.** Nội dung văn hóa phải truy vết được tới nguồn, evidence, người xác nhận và phiên bản.
4. **Không giả vờ chắc chắn.** UNKNOWN, nhiều candidate và human review là kết quả hợp lệ.
5. **Mobile-first, PWA-first.** Không yêu cầu cài app cho luồng khám phá công khai.
6. **Một hành trình xuyên suốt, không phải các module rời rạc.** Mỗi màn hình phải dẫn tới bước tiếp theo có ngữ cảnh.
7. **Đa ngôn ngữ và đa biến thể.** Không ép một tên gọi, cách phát âm hoặc cách diễn giải thành “chuẩn duy nhất”.
8. **Privacy và cultural safety by design.** Dữ liệu restricted phải bị chặn trước retrieval, không chỉ ẩn ở UI.

## 4. Vòng trải nghiệm cốt lõi

```text
Quét/QR
  → Hiểu nội dung có nguồn
  → Nghe audio / xem bản đọc sâu
  → Mở địa điểm hoặc hành trình liên quan
  → Làm quiz / học từ Khmer
  → Lưu vào Phum Passport
  → Đóng góp tư liệu mới
  → Reviewer xác minh và công bố
  → PhumData được làm giàu
```

## 5. Phân hệ sản phẩm

| Phân hệ | Giá trị chính | R1 |
|---|---|---:|
| PhumData | Kho tri thức có version, nguồn, quyền và lịch sử xác minh | Bắt buộc |
| AI Cultural Scanner | Quan sát ảnh, truy xuất candidate, trả nội dung grounded | Bắt buộc |
| Heritage & Festival Map | Khám phá địa điểm, nearby, tuyến mẫu, check-in | Bắt buộc |
| Interactive Khmer Handbook | Từ vựng, phát âm, ví dụ, flashcard và liên kết di sản | Bắt buộc |
| Digital Culture Olympiad | Quiz cá nhân và competition realtime | Demo R1 |
| Phum Passport | Lịch sử scan/check-in/quiz, bookmark, tiến độ và huy hiệu | Bắt buộc |
| Community Contribution | Gửi media/câu chuyện/audio với consent | Bắt buộc |
| Moderation & Publication | Review, yêu cầu sửa, phê duyệt, publish, dispute/takedown | Bắt buộc |
| Admin Portal | Quản trị dữ liệu, review queue, event, audit và cấu hình | Bắt buộc |

## 6. Người dùng chính

| Persona/Actor | Mục tiêu |
|---|---|
| Du khách lần đầu | Nhận biết biểu tượng tại chỗ, nghe thuyết minh, tìm điểm tiếp theo mà không phải cài app |
| Học sinh/người học | Học từ Khmer, làm quiz, thu thập huy hiệu và tham gia Olympiad |
| Contributor bản địa | Đóng góp audio/ảnh/câu chuyện và theo dõi trạng thái xử lý |
| Cultural Reviewer | Đối chiếu nguồn, consent, mức nhạy cảm và quyết định phạm vi công bố |
| Organization Manager | Tạo sự kiện/cuộc thi, mời người tham gia và theo dõi vận hành |
| System Admin | Quản trị role, cấu hình, tích hợp, audit và sự cố |

## 7. Release 1 — MVP bắt buộc

- Dữ liệu demo: **3–5 địa điểm**, **20–30 thực thể văn hóa**, **20 từ/âm thanh**, **30 câu hỏi**, đầy đủ nguồn và quyền.
- Luồng du khách: `Mở PWA → scan/QR → nội dung có nguồn/audio → map → quiz → badge/passport`.
- Luồng cộng đồng: `Tạo contribution → media/consent → submit → review → sửa hoặc approve → publish`.
- Map: danh sách/ghim, nearby, filter, tuyến mẫu và mở điều hướng ngoài.
- Olympiad: quiz cá nhân và một competition demo có join code, timer, server scoring, leaderboard.
- Offline: app shell, nội dung đã tải và tuyến mẫu; AI scan cần mạng nhưng có thể lưu ảnh chờ gửi.
- Admin: CRUD PhumData/source/media, review queue, publish, audit log và dashboard tối thiểu.

## 8. UX không được bỏ sót

- Bottom navigation PWA phải tạo lối vào rõ cho Home/Explore, Map, Scan, Learn và Passport theo thiết kế được chốt.
- Nội dung văn hóa luôn hiển thị provenance, verification label hoặc nhãn “đang kiểm tra”.
- Scanner không chắc chắn phải hiển thị tối đa 3 candidate, hướng dẫn chụp lại hoặc gửi review.
- Mọi flow phải có trạng thái loading, empty, partial, offline, permission denied, retry và expired session.
- Consent phải dùng ngôn ngữ dễ hiểu, granular, không pre-check và có đường sửa/rút lại.
- Olympiad dùng thời gian server; reconnect không được làm UI tạo ấn tượng answer đã được chấp nhận khi server chưa xác nhận.
- Accessibility là yêu cầu nền: contrast, touch target, keyboard focus, alt text, transcript và reduced motion.

## 9. Ngoài phạm vi R1

- Thay thế hệ thống quản lý di sản chính thức của cơ quan nhà nước.
- AI tự xác lập “sự thật văn hóa”, tự tạo entity hoặc tự publish.
- Face recognition, sinh trắc học hoặc suy đoán danh tính/dân tộc/tôn giáo.
- Thanh toán, đặt tour/khách sạn, bán vé hoặc thương mại điện tử.
- Huấn luyện foundation model riêng từ dữ liệu cộng đồng.
- Microservices/Kubernetes bắt buộc cho MVP.

## 10. Chỉ số mục tiêu ban đầu

| Nhóm | Mục tiêu |
|---|---|
| Dữ liệu | ≥100 thực thể mẫu ở cấp sản phẩm; 80% bản ghi công bố có nguồn và người/đơn vị xác nhận; 100% media có quyền sử dụng |
| Trải nghiệm | ≥70% người dùng demo hoàn thành luồng scan → nội dung → map/quiz; task error <5% |
| AI | Top-3 accuracy ≥85%; false assertion ở nhóm confidence thấp <3% |
| Đóng góp | 100% contribution có consent; review median ≤5 ngày làm việc trong pilot |
| Kỹ thuật | P95 API thường <500 ms; P95 scan end-to-end <12 giây; uptime pilot ≥99,5% |
| Sự kiện | Mục tiêu kiểm thử: 500 người đồng thời và 50 answer submissions/giây |
