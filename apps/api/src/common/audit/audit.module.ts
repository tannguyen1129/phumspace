import { Global, Module } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";

/** Import 1 lan trong AppModule — AuditLogService kha dung o moi module (moderation, va sau nay contribution/admin...). */
@Global()
@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
