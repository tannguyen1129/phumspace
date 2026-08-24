import { Global, Inject, Module, type OnModuleDestroy } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL, pgPoolProvider } from "./pg-pool.provider";

export { PG_POOL };

/**
 * Module toan cuc cung cap pg.Pool cho moi module khac qua @Inject(PG_POOL).
 * Import 1 lan duy nhat trong AppModule (@Global lam no kha dung o moi noi con lai).
 */
@Global()
@Module({
  providers: [pgPoolProvider],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
