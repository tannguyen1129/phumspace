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
pnpm install
```

---

### Bước 3: Tạo các Tệp Môi trường Local (.env)

```bash
# 1. Root environment
cp .env.example .env

# 2. Backend API environment
cp apps/api/.env.example apps/api/.env

# 3. Frontend Web environment
cp apps/web/.env.example apps/web/.env
```

---

### Bước 4: Khởi động Cơ sở Dữ liệu PostgreSQL 17

```bash
# Khởi động PostgreSQL container ở chế độ background
docker compose up -d

# Kiểm tra trạng thái container (phải hiển thị status: healthy)
docker compose ps
```

Dừng PostgreSQL khi không làm việc:

```bash
docker compose down
```

---

### Bước 5: Chạy Migration & Seed Dữ liệu PhumData Core

```bash
# 1. Thực hiện migration khởi tạo PhumData Core (Sprint 1)
pnpm prisma:migrate

# 2. Sinh Prisma Client
pnpm prisma:generate

# 3. Nạp dữ liệu seed demo (Khởi tạo HeritageEntities, Places, Categories, Sources)
pnpm prisma:seed

# 4. Mở Prisma Studio để xem dữ liệu trực quan trên giao diện web (Cổng 5555)
pnpm prisma:studio
```

---

## 3. Khởi động Ứng dụng ở Môi trường Local

### Chạy Đồng thời Frontend và Backend API

```bash
pnpm dev
```

- **Frontend Next.js**: `http://localhost:3000`
- **Backend NestJS**: `http://localhost:3001` (Global prefix `/api/v1`)
- **Swagger / OpenAPI Documentation**: `http://localhost:3001/api/docs`

---

## 4. Các URLs Local Quan trọng

| Dịch vụ | URL | Ghi chú |
|---|---|---|
| **Frontend Web** | `http://localhost:3000` | Trang giới thiệu PhumSpace & API Status |
| **API Health Check** | `http://localhost:3001/api/v1/health` | GET Health status endpoint |
| **Swagger API Docs** | `http://localhost:3001/api/docs` | Tài liệu OpenAPI tương tác trực tiếp |
| **Prisma Studio** | `http://localhost:5555` | Giao diện xem/quản trị DB PostgreSQL |
| **PostgreSQL Database** | `localhost:5432` | DB: `phumspace`, User: `phumspace`, Pass: `phumspace_dev_password` |

---

## 5. Danh sách REST APIs Public (Sprint 1 PhumData Core)

Toàn bộ Public REST APIs chỉ trả về dữ liệu đã **PUBLISHED**, tuyệt đối không rò rỉ dữ liệu bản thảo (`DRAFT`) hoặc dữ liệu kiểm duyệt nội bộ:

- `GET /api/v1/heritage-entities` — Danh sách phân trang các thực thể di sản (Hỗ trợ `page`, `limit`, `categorySlug`, `placeSlug`).
- `GET /api/v1/heritage-entities/:slug` — Chi tiết thực thể di sản theo slug (Trả về 404 nếu không tồn tại hoặc chưa công bố).
- `GET /api/v1/places` — Danh sách các địa điểm di sản.
- `GET /api/v1/places/:slug` — Chi tiết địa điểm theo slug.
- `GET /api/v1/categories` — Danh sách danh mục di sản.

---

## 6. Lệnh Kiểm thử, Lint và Build

```bash
# 1. Kiểm tra Type-check & Strict Mode cho toàn monorepo
pnpm lint

# 2. Chạy Unit & Integration Tests (Bao gồm các test quy tắc an toàn dữ liệu PhumData)
pnpm test

# 3. Build sản phẩm sản xuất (Packages -> API -> Web)
pnpm build
```

---

## 7. Lệnh Kiểm tra Hệ thống (System Verification Commands)

```bash
# 1. Kiểm tra danh sách thực thể di sản đã công bố
curl -i http://localhost:3001/api/v1/heritage-entities

# 2. Kiểm tra chi tiết Chùa Âng (chua-hang-tra-vinh)
curl -i http://localhost:3001/api/v1/heritage-entities/chua-hang-tra-vinh

# 3. Kiểm tra trường hợp slug DRAFT hoặc không tồn tại (Phải trả HTTP 404 Not Found)
curl -i http://localhost:3001/api/v1/heritage-entities/banh-tet-tra-cuon

# 4. Kiểm tra danh sách địa điểm
curl -i http://localhost:3001/api/v1/places

# 5. Kiểm tra danh sách danh mục di sản
curl -i http://localhost:3001/api/v1/categories
```

---

## 8. Cấu trúc Monorepo

```text
phumspace-prj/
├── apps/
│   ├── api/          # Backend NestJS (Port 3001, Prefix /api/v1, Prisma, HealthModule, PhumDataModule, Swagger)
│   └── web/          # Frontend Next.js App Router (Port 3000, Tailwind CSS, API Status)
├── packages/
│   └── contracts/    # Shared API contracts & TypeScript interfaces (@phumspace/contracts)
├── docs/             # Tài liệu gốc & bối cảnh dự án (docs/context, docs/original)
├── docker-compose.yml# PostgreSQL 17 Docker Compose configuration
├── package.json      # Workspace root package configuration
└── pnpm-workspace.yaml # Monorepo workspace configuration
```
