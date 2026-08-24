import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

/**
 * JwtModule.register({}) khong can secret mac dinh vi JwtAuthGuard/TokenService luon truyen
 * secret tuong minh (JWT_ACCESS_SECRET) trong tung loi goi sign/verify — tranh secret ngam dinh
 * bi quen cau hinh. Import 1 lan trong AppModule (@Global lam JwtService/guard kha dung khap noi).
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthCommonModule {}
