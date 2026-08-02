# PhumSpace — Kịch bản Trình diễn Demo 5–7 Phút

Tài liệu này cung cấp kịch bản từng phút chuẩn bị cho buổi Trình diễn / Nộp dự án PhumSpace.

---

## 🕒 Phút 1–2: Trang chủ, Khám phá & Bản đồ Di sản Khmer Trà Vinh
- **Thao tác**: Mở `http://localhost:3000`.
- **Nội dung trình bày**: Giới thiệu PhumSpace — Nền tảng số hóa văn hóa Khmer Nam Bộ. Truy cập trang `/kham-pha` xem danh mục di sản kiến trúc (Wat Kompong Chray - Chùa Âng) và Lễ hội Ok Om Bok.
- **Điểm nhấn**: Mở trang `/ban-do` hiển thị danh thắng Ao Bà Om trên bản đồ vệ tinh tương tác Google Maps Platform.

---

## 🕒 Phút 3: Trải nghiệm AI Cultural Scanner (Sprint 4A & 4B)
- **Thao tác**: Truy cập `/quet-di-san`. Tải ảnh di sản Chùa Âng.
- **Nội dung trình bày**: Hệ thống đối chiếu hình ảnh thực tế với PhumData Core công bố. Trả kết quả `MATCH` nhận diện chính xác Chùa Âng kèm liên kết chi tiết di sản.
- **Điểm thưởng**: Khám phá trang Phum Passport `/ho-chieu` minh chứng nhận thưởng điểm văn hóa tự động.

---

## 🕒 Phút 4: Sổ tay Tiếng Khmer Nam Bộ & Thẻ ghi nhớ Flashcards (Sprint 7A & 7B)
- **Thao tác**: Mở `/so-tay`. Tra cứu từ vựng chữ Khmer nguyên bản `វត្ត` (`wat`).
- **Nội dung trình bày**: Giới thiệu chữ Khmer nguyên bản `lang="km"`, phiên âm IPA, nghĩa tiếng Việt/Anh và phát âm người bản địa Trà Vinh.
- **Flashcards**: Nhấp "Bắt đầu Học Flashcards" tại bộ sưu tập "Từ vựng Nhập môn". Thực hiện lật thẻ 3D, chọn "Đã nhớ từ này" và nhận **+20pt Passport** thưởng bài học.

---

## 🕒 Phút 5: Thử thách Quiz Kiến thức & Đóng góp Cộng đồng
- **Thao tác**: Mở `/thu-thach/thu-thach-di-san-tra-vinh`. Làm bài Quiz 2 câu hỏi.
- **Đóng góp**: Truy cập `/dong-gop/moi` gửi tư liệu di sản chờ kiểm duyệt.

---

## 🕒 Phút 6–7: Admin Staff Moderation & Publication Workflow (Sprint 6B.1 & 6B.2)
- **Thao tác**: Mở `/admin/dang-nhap`. Đăng nhập bằng tài khoản Staff Admin `admin.test@phumspace.vn`.
- **Nội dung trình bày**: Mở Hàng đợi đóng góp `/admin/dong-gop`, nhận lượt review (`Assign`), thẩm định 10 tiêu chí Checklist & Consent Gate.
- **Xuất bản**: Tiến hành **Xuất bản bài đóng góp vào PhumData Core**. Minh chứng bản ghi `HeritageEntityVersion` mới được tạo nguyên tử mà **không sửa đè phiên bản `PUBLISHED` cũ**.

---

## 🛡️ Phương án Dự phòng khi Gặp Sự cố (Demo Fallback Matrix)

| Sự cố kỹ thuật | Phương án xử lý |
|---|---|
| Gemini API hết Quota / Mạng chậm | Hệ thống tự động chuyển sang **Demo Mock Provider** hiển thị nhãn `"Demo Mode: Phân tích Di sản Giả lập"` mà không gây crash |
| Google Maps API lỗi Key | Bản đồ hiển thị giao diện fallback dự phòng cho các địa điểm văn hóa Trà Vinh |
| OIDC Single Sign-on | Sử dụng tài khoản Staff Admin đã được cấp quyền sẵn qua CLI `pnpm --filter api staff:provision` |
