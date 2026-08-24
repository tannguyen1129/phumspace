# Ghi chú di chuyển hạ tầng cloud (tham khảo — CHƯA triển khai)

> **Trạng thái: chỉ là tài liệu tham khảo.** Không có tài khoản/dự án cloud thật nào được đụng
> tới khi viết tài liệu này. Không deploy cho tới khi có quyết định rõ ràng (ngân sách, nhà cung
> cấp, chủ tài khoản) — xem `plan.md` Milestone M8, mục "Hạ tầng cloud".

## Khi nào cần đọc tài liệu này

Docker Compose (`infra/docker-compose.yml`) đủ dùng cho local dev, demo và Pilot quy mô nhỏ
(GĐ1–đầu GĐ2). Chỉ cân nhắc di chuyển khi có tín hiệu scale thật: nhiều địa điểm/đối tác đồng
thời truy cập, cần uptime SLA cao hơn 1 VM, hoặc cần tách môi trường staging/production rõ ràng
(điều kiện chuyển GĐ2→GĐ3 theo roadmap gốc: "SLA review vận hành thực tế").

## Ánh xạ dịch vụ (Docker Compose → Google Cloud)

| Compose service | Vai trò hiện tại | Gợi ý cloud managed | Ghi chú |
|---|---|---|---|
| `postgres` (postgis/postgis:16) | DB chính, PostGIS cho toạ độ | **Cloud SQL for PostgreSQL** | Cloud SQL hỗ trợ extension PostGIS trực tiếp (`CREATE EXTENSION postgis`) — không cần đổi migration. |
| `redis` | Queue BullMQ (`ai-scan`) | **Memorystore for Redis** | Không cần đổi code — `REDIS_URL` trỏ instance mới. |
| `minio` | Object storage (S3-compatible) | Giữ MinIO trên 1 VM nhỏ, HOẶC **Cloud Storage** qua lớp tương thích S3 | `MediaStorageService` (`apps/api/src/common/storage/`) dùng `@aws-sdk/client-s3` với `forcePathStyle: true` — đổi sang GCS thật cần viết lại provider này (không nhỏ, chưa cần thiết ở quy mô Pilot). |
| `api` / `worker` / `web` | 3 service Node | **Cloud Run** (3 service riêng) | Stateless, phù hợp Cloud Run. `worker` không nhận HTTP traffic — cấu hình `--no-cpu-throttling` hoặc dùng Cloud Run jobs/always-on nếu cần xử lý nền liên tục thay vì scale-to-zero. |

## Env var cần rà lại khi triển khai thật (không đổi gì trong repo lúc này)

Toàn bộ biến đã có sẵn trong `.env.example` — khi triển khai Cloud Run chỉ cần trỏ giá trị sang
instance managed thay vì đổi code:

```
DATABASE_URL      → connection string Cloud SQL (qua Cloud SQL Auth Proxy hoặc Private IP)
REDIS_URL         → connection string Memorystore
S3_ENDPOINT       → giữ MinIO VM, hoặc endpoint GCS S3-compatible
WEB_BASE_URL       → domain thật của web service trên Cloud Run (dùng cho CORS allowlist)
JWT_ACCESS_SECRET / JWT_REFRESH_SECRET → chuyển sang Secret Manager, KHÔNG đặt trực tiếp trong
                      biến môi trường Cloud Run console
GEMINI_API_KEY     → Secret Manager
```

## File mẫu

`cloud-run-api.example.yaml` — Cloud Run service manifest mẫu cho `apps/api`, dùng
`gcloud run services replace` khi thật sự triển khai. Chưa test trên project GCP thật — coi đây
là điểm khởi đầu, không phải cấu hình production sẵn sàng dùng ngay.

## Việc CHƯA làm (có chủ đích, ngoài phạm vi M8)

- Chưa tạo project/tài khoản GCP nào.
- Chưa viết Terraform/Pulumi — quyết định IaC tool nên chờ đến khi thật sự cần deploy, tránh
  duy trì code hạ tầng không ai chạy.
- Chưa đổi `MediaStorageService` sang GCS native — MinIO qua S3 API vẫn hoạt động tốt ở quy mô
  Pilot, đổi provider là quyết định riêng khi có lý do cụ thể (chi phí, giới hạn MinIO VM...).
- Chưa có CI/CD pipeline deploy tự động lên Cloud Run.
