import { Module } from "@nestjs/common";
import { AdminController } from "./interface/admin.controller";

/**
 * AdminModule — Admin/Analytics/Audit — dashboard quan tri, cau hinh he thong, bao cao va audit log tap trung.
 *
 * Cau truc DDD (System Design Document, muc kien truc module):
 *   interface/      controller, DTO input/output huong ra ngoai
 *   application/     use case / service dieu phoi nghiep vu
 *   domain/          entity, value object, business rule thuan tuy
 *   infrastructure/  repository, adapter goi DB/queue/API ngoai
 * Module khac chi duoc goi qua application facade hoac event — khong import
 * truc tiep repository/entity noi bo cua module nay.
 *
 * O Milestone M0 chi co interface/ (health endpoint) de xac nhan wiring; cac layer
 * con lai duoc trien khai dan theo tung milestone — xem plan.md muc 2.4.
 */
@Module({
  controllers: [AdminController],
})
export class AdminModule {}
