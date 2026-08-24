import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

/**
 * RateLimitModule — "Rate limit theo IP/user/action; Scanner, login, upload va join
 * competition co policy rieng" (System Design muc 16.2). MVP chay 1 instance qua Docker
 * Compose (xem plan.md muc 2.1) nen dung storage in-memory mac dinh cua @nestjs/throttler la
 * du — chuyen sang storage Redis khi scale nhieu instance o GD2.
 *
 * "default" la gioi han chung cho moi endpoint (khoa theo IP); tung controller override rieng
 * qua @Throttle({ default: { limit, ttl } }) cho cac hanh dong nhay cam hon (login, scan, ...).
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 120,
      },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
