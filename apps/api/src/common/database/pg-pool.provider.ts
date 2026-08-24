import type { Provider } from "@nestjs/common";
import { Pool } from "pg";
import { loadEnv } from "@phumspace/config";

/** Token DI cho pg.Pool dung chung toan bo apps/api — 1 pool duy nhat, khong tao Pool moi trong tung repository. */
export const PG_POOL = Symbol("PG_POOL");

export const pgPoolProvider: Provider = {
  provide: PG_POOL,
  useFactory: (): Pool => {
    const env = loadEnv();
    return new Pool({ connectionString: env.DATABASE_URL });
  },
};
