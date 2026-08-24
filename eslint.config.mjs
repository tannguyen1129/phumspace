// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Config dung chung cho toan monorepo. Moi package/app goi "eslint ." trong script "lint"
 * cua rieng no; ESLint flat config tu dong duoc tim tu thu muc hien tai len root nay.
 * Chi la baseline recommended o Milestone M0 — sieu chat che hon (import order, a11y jsx...)
 * se duoc bo sung khi can trong cac milestone sau.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      // File Next.js tu sinh/cap nhat (bao gom triple-slash reference toi .next/types) — quy uoc
      // chuan cua Next la khong lint file nay, xem eslint-config-next mac dinh cung ignore.
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
    },
  },
  {
    // File .js con lai (vd migration node-pg-migrate dung CommonJS) — TS files da co
    // no-undef tat san boi typescript-eslint recommended nen khong can o day.
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        exports: "writable",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
      },
    },
  },
  {
    // Service worker chay trong global scope rieng (khong phai Node/browser thong thuong).
    files: ["**/public/sw.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        clients: "readonly",
        URL: "readonly",
        Response: "readonly",
      },
    },
  }
);
