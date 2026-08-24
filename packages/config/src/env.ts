import { z } from "zod";

/**
 * Schema bien moi truong dung chung cho api/worker.
 * Moi service goi `loadEnv()` mot lan luc bootstrap thay vi doc process.env truc tiep,
 * de fail-fast khi thieu cau hinh thay vi loi ngam o runtime.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("us-east-1"),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MEDIA_BUCKET: z.string().default("phumspace-media"),

  API_PORT: z.coerce.number().int().positive().default(3001),
  WEB_BASE_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("PhumSpace <no-reply@phumspace.local>"),
  MFA_ENCRYPTION_KEY: z.string().min(16).optional().default("development-mfa-key-change-me"),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_VISION_MODEL_ALIAS: z.string().default("vision_fast"),
  GEMINI_SYNTHESIS_MODEL_ALIAS: z.string().default("grounded_quality"),

  SCANNER_CONFIDENCE_MATCH_THRESHOLD: z.coerce.number().min(0).max(1).default(0.78),
  SCANNER_CONFIDENCE_SUGGEST_THRESHOLD: z.coerce.number().min(0).max(1).default(0.55),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | undefined;

/** Doc + validate process.env; nem loi ro rang neu thieu bien bat buoc thay vi crash mo ho sau nay. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Cau hinh moi truong khong hop le:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Chi danh cho test: reset cache giua cac test case. */
export function __resetEnvCacheForTests(): void {
  cached = undefined;
}
