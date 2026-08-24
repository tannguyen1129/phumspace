import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest, AuthenticatedUser } from "./jwt-auth.guard";

/** Chi dung tren endpoint da co JwtAuthGuard — request.authUser luon ton tai luc nay. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.authUser) {
    throw new Error("CurrentUser decorator dung ngoai JwtAuthGuard — kiem tra lai @UseGuards.");
  }
  return request.authUser;
});
