# PhumSpace — Release & QA Verification Checklist

Danh mục kiểm định chất lượng phát hành dự án PhumSpace (Sprint 8A):

---

## 1. Quality & Test Coverage
- [x] Passed **50/50 unit & integration tests** (`pnpm test`).
- [x] Passed **100% TypeScript type-check** (`pnpm lint`).
- [x] Built production bundle **24/24 Next.js routes** (`pnpm build`).
- [x] Playwright E2E Critical Journeys test suite (`pnpm e2e`).

---

## 2. Database & Data Governance
- [x] Schema PostgreSQL 17 đồng bộ qua Prisma Migration.
- [x] Seed dữ liệu 15 Khmer terms, 3 Topics, 2 Collections, Heritage Entities và Quizzes lặp lại an toàn.
- [x] Kiểm tra Foreign Key constraint delete behavior (`onDelete: Cascade / SetNull`).
- [x] Không sửa đè trực tiếp phiên bản di sản đã `PUBLISHED`.

---

## 3. Security & Privacy
- [x] Tách biệt 2 cookie `phum_passport_session` và `phum_admin_session`.
- [x] Endpoint stream media trả header `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`.
- [x] Khóa API Secrets (`GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`) không để lộ ra client-side.
- [x] Fail-fast Startup Environment Validation.

---

## 4. Observability & Health
- [x] Correlation ID Middleware (`x-correlation-id`) gán vết request.
- [x] Endpoints `/api/v1/health/liveness` và `/api/v1/health/readiness` (DB Ping).

---

## 5. Docker Readiness
- [x] `Dockerfile.api` đóng gói NestJS API sản xuất (`node:20-alpine`, non-root user `node`, `HEALTHCHECK`).
- [x] `Dockerfile.web` đóng gói Next.js Web sản xuất (Standalone Output Mode).
- [x] `docker-compose.prod.yml` khởi chạy môi trường sản xuất.
