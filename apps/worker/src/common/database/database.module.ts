import { Global, Inject, Module, type OnModuleDestroy, type Provider } from "@nestjs/common";
import { Pool } from "pg";
import { loadEnv } from "@phumspace/config";

/**
 * Mirror cua apps/api/src/common/database/database.module.ts. apps/api va apps/worker la
 * hai NestJS app doc lap (khong the chia se module instance) nen file nay duoc lap lai co
 * chu y thay vi tao mot package dung chung chi cho vai chuc dong — giu moi app tu chu ha tang.
 */
export const PG_POOL = Symbol("PG_POOL");

const pgPoolProvider: Provider = {
  provide: PG_POOL,
  useFactory: (): Pool => {
    const env = loadEnv();
    return new Pool({ connectionString: env.DATABASE_URL });
  },
};

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
