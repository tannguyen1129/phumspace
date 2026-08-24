import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@phumspace/contracts";

export const ROLES_KEY = "roles";

/** Danh sach role duoc phep goi endpoint — dung cung RolesGuard, dat SAU JwtAuthGuard. */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
