# PhumSpace — Heritage & Cultural Platform (Sprint 0)

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

Do dự án sử dụng `pnpm workspace`, trước tiên hãy kích hoạt `pnpm 9` mà không cần cài đặt package global:

```bash
corepack prepare pnpm@9 --activate
pnpm -v
```

*Kỳ vọng output:* `9.15.9` hoặc phiên bản pnpm 9.x tương đương.

---

### Bước 2: Cài đặt Dependencies Toàn bộ Workspace

```bash
pnpm install
```

---

### Bước 3: Tạo các Tệp Môi trường Local (.env)

Sao chép từ các tệp `.env.example` mẫu:

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

Xóa toàn bộ volume dữ liệu khi cần reset:

```bash
docker compose down -v
```

---

### Bước 5: Sinh Prisma Client

```bash
pnpm --filter api exec prisma generate
```

---

## 3. Khởi động Ứng dụng ở Môi trường Local

### Chạy Đồng thời Frontend và Backend API

```bash
pnpm dev
```

Lệnh này sẽ khởi động đồng thời:
- **Frontend Next.js**: `http://localhost:3000`
- **Backend NestJS**: `http://localhost:3001` (Global prefix `/api/v1`)

### Hoặc Khởi động Riêng lẻ:

```bash
# Chỉ chạy Backend NestJS API (Port 3001)
pnpm dev:api

# Chỉ chạy Frontend Next.js Web (Port 3000)
pnpm dev:web
```

---

## 4. Các URLs Local Quan trọng

| Dịch vụ | URL | Ghi chú |
|---|---|---|
| **Frontend Web** | `http://localhost:3000` | Trang giới thiệu PhumSpace & API Connection Status |
| **API Health Check** | `http://localhost:3001/api/v1/health` | GET Health status endpoint |
| **PostgreSQL Database** | `localhost:5432` | DB: `phumspace`, User: `phumspace`, Pass: `phumspace_dev_password` |

---

## 5. Lệnh Kiểm thử, Lint và Build

```bash
# 1. Kiểm tra Type-check & Strict Mode cho toàn monorepo
pnpm lint

# 2. Chạy Unit Tests cho các modules (HealthModule)
pnpm test

# 3. Build sản phẩm sản xuất (Packages -> API -> Web)
pnpm build
```

---

## 6. Lệnh Kiểm tra Hệ thống (System Verification Commands)

```bash
# Kiểm tra Health Endpoint của Backend API
curl -i http://localhost:3001/api/v1/health

# Output kỳ vọng:
# HTTP/1.1 200 OK
# Content-Type: application/json; charset=utf-8
# {"status":"ok","service":"phumspace-api","timestamp":"2026-08-02T..."}
```

---

## 7. Cấu trúc Monorepo

```text
phumspace-prj/
├── apps/
│   ├── api/          # Backend NestJS (Port 3001, Prefix /api/v1, Prisma, HealthModule)
│   └── web/          # Frontend Next.js App Router (Port 3000, Tailwind CSS, API Status)
├── packages/
│   └── contracts/    # Shared API contracts & TypeScript interfaces (@phumspace/contracts)
├── docs/             # Tài liệu gốc & bối cảnh dự án (docs/context, docs/original)
├── docker-compose.yml# PostgreSQL 17 Docker Compose configuration
├── package.json      # Workspace root package configuration
└── pnpm-workspace.yaml # Monorepo workspace configuration
```
