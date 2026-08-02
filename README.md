# PhumSpace — Heritage & Cultural Platform

PhumSpace là nền tảng AI-powered phục vụ khám phá, học tập, bảo tồn và truyền bá di sản văn hóa Khmer Nam Bộ, khởi tạo tại Trà Vinh.

---

## 1. Yêu cầu Môi trường (System Requirements)

Hệ điều hành khuyến nghị: **WSL Ubuntu / Linux**

- **Git**: `>= 2.40.0`
- **Node.js**: `>= 20.x` (Đã kiểm thử trên Node.js `v20.20.2`)
- **pnpm**: `v9.x` (Kích hoạt trực tiếp qua Node.js Corepack)
- **Docker & Docker Compose**: `>= 24.x` / Docker Compose `v2.x`+
- **PostgreSQL**: `17` (Khởi chạy qua Docker Compose)

---

## 2. Hướng dẫn Khởi tạo Môi trường Phát triển Local

### Bước 1: Kích hoạt pnpm v9 bằng Corepack

```bash
corepack prepare pnpm@9 --activate
pnpm -v
```

---

### Bước 2: Cài đặt Dependencies Toàn bộ Workspace

```bash
pnpm install --frozen-lockfile
```

---

### Bước 3: Tạo các Tệp Môi trường Local (.env)

```bash
# 1. Root environment
cp .env.example .env

# 2. Backend API environment
cp apps/api/.env.example apps/api/.env

# 3. Frontend Web environment
cp apps/web/.env.example apps/web/.env.local
```

---

### Bước 4: Khởi động Cơ sở Dữ liệu PostgreSQL 17

```bash
# Khởi động PostgreSQL container ở chế độ background
docker compose up -d

# Kiểm tra trạng thái container (phải hiển thị status: healthy)
docker compose ps
```

---

### Bước 5: Chạy Migration & Seed Dữ liệu

```bash
# 1. Thực hiện migration khởi tạo DB
pnpm prisma:migrate

# 2. Sinh Prisma Client
pnpm prisma:generate

# 3. Nạp dữ liệu seed demo (Khmer Terms, Heritage Entities, Quizzes & Achievements)
pnpm prisma:seed
```

---

### Bước 6: Cấp khoản Nhân sự Staff Admin

```bash
# Cấp tài khoản ADMIN (Có quyền Approve & Publish vào PhumData Core)
pnpm --filter api staff:provision --email="admin.test@phumspace.vn" --role="ADMIN" --name="Admin Demo"
```

---

## 3. Khởi động Ứng dụng & Routes

```bash
pnpm dev
```

- **Frontend Web**: `http://localhost:3000`
- **Sổ tay Tiếng Khmer Nam Bộ**: `http://localhost:3000/so-tay`
- **Học Flashcards Tương tác**: `http://localhost:3000/so-tay/bo-suu-tap/tu-vung-nhap-mon/hoc`
- **AI Cultural Scanner**: `http://localhost:3000/quet-di-san`
- **Đăng nhập Quản trị Admin**: `http://localhost:3000/admin/dang-nhap`
- **Admin Moderation Dashboard**: `http://localhost:3000/admin`
- **Backend NestJS API**: `http://localhost:3001` (Global prefix `/api/v1`)
- **Readiness Health Endpoint**: `http://localhost:3001/api/v1/health/readiness`
- **Swagger / OpenAPI Documentation**: `http://localhost:3001/api/docs`

---

## 4. Multi-Stage Production Docker Build & Release Verification

```bash
# 1. Kiểm tra Type-check & Linter toàn bộ Monorepo (Passed 100%)
pnpm lint

# 2. Chạy Unit & Integration Tests (Passed 69/69 tests)
pnpm test

# 3. Build sản phẩm sản xuất (Packages -> API -> Web)
pnpm build

# 4. Kiểm định lại tổng điểm Passport Idempotency
pnpm passport:rebuild-points

# 5. Khởi động Production Containers với Docker Compose
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 5. Tài liệu Phát triển & Kịch bản Demo

- [docs/development/demo-script.md](file:///home/sontan29/project/phumspace-prj/docs/development/demo-script.md): Kịch bản Trình diễn Demo 5–7 phút & Phương án dự phòng.
- [docs/development/release-checklist.md](file:///home/sontan29/project/phumspace-prj/docs/development/release-checklist.md): Danh mục kiểm định chất lượng phát hành.
