# syntax=docker/dockerfile:1
# Build tu root monorepo: `docker build -f apps/api/Dockerfile ..` (context = repo root).
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
RUN pnpm --filter @phumspace/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api ./apps/api
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
