import { Controller, Get } from "@nestjs/common";

export interface AdminHealthResponse {
  module: "admin";
  status: "ok";
}

/**
 * AdminController — placeholder cho Milestone M0.
 * Endpoint nghiep vu that (theo FR trong SRS) se duoc them tu milestone tuong ung
 * trong plan.md muc 2.4, cung voi application/domain/infrastructure layer.
 */
@Controller("admin")
export class AdminController {
  @Get("health")
  health(): AdminHealthResponse {
    return { module: "admin", status: "ok" };
  }
}
