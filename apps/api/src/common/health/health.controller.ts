import { Controller, Get } from "@nestjs/common";

export interface HealthResponse {
  status: "ok";
  service: "api";
  timestamp: string;
}

/** Endpoint /health nam ngoai global prefix /v1 — dung cho load balancer / docker healthcheck. */
@Controller("health")
export class HealthController {
  @Get()
  check(): HealthResponse {
    return { status: "ok", service: "api", timestamp: new Date().toISOString() };
  }
}
