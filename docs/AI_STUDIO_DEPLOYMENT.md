# Đưa PhumSpace vào Google AI Studio

## Import mã nguồn

1. Mở **Build** trong Google AI Studio.
2. Chọn **Add files (+) → Import from GitHub**.
3. Chọn repository `tannguyen1129/phumspace`, nhánh `main`.
4. Trong **Settings → Secrets**, thêm `GEMINI_API_KEY`. Tuyệt đối không đổi biến này thành
   `NEXT_PUBLIC_*` hoặc đưa giá trị thật vào file trong Git.

## Kiến trúc triển khai

PhumSpace là monorepo nhiều dịch vụ, không phải một tiến trình Node duy nhất:

- `apps/web`: Next.js frontend;
- `apps/api`: NestJS REST API;
- `apps/worker`: BullMQ worker gọi Gemini phía server;
- PostgreSQL/PostGIS, Redis và S3-compatible object storage.

AI Studio có thể import repository để tiếp tục phát triển. Khi publish production, cần triển
khai web, API và worker thành các service riêng; cấu hình database, Redis và object storage bằng
dịch vụ managed. Các manifest tham khảo nằm trong `infra/cloud/`.

## Biến môi trường bắt buộc

Dùng `.env.staging.example` làm checklist. Tối thiểu cần có `DATABASE_URL`, `REDIS_URL`, thông
tin S3, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `WEB_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`
và `GEMINI_API_KEY`.

Gemini được gọi duy nhất từ worker qua `@google/genai`. Hai alias `vision_fast` và
`grounded_quality` hiện ánh xạ tới `gemini-3.6-flash`; có thể ghi đè bằng
`GEMINI_VISION_MODEL_ALIAS` và `GEMINI_SYNTHESIS_MODEL_ALIAS` mà không sửa code.

## Release gate

Trước khi publish: chạy `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e`;
áp dụng migration và seed trên môi trường mới; kiểm tra CORS theo URL thật; xác minh Scanner bằng
ảnh thật; hoàn tất cultural sign-off trước khi gắn nhãn nội dung đã xác minh.
