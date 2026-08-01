# PhumSpace Agent Instructions

## Product context

PhumSpace is an AI-powered platform for discovering, learning,
preserving, and transmitting Southern Khmer cultural heritage,
starting with Tra Vinh.

The core experience is:

Discover → Experience → Learn → Contribute → Preserve

The official summarized project context is stored in:

- docs/context/product-context.md
- docs/context/requirements-summary.md
- docs/context/architecture-decisions.md
- docs/context/database-summary.md
- docs/context/ai-rules.md
- docs/context/domain-glossary.md

Original Word documents are stored under docs/original.

## Target architecture

- Monorepo: pnpm workspace
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: NestJS modular monolith
- API: REST and OpenAPI
- Database: PostgreSQL
- ORM: Prisma
- AI: Gemini API with structured outputs and grounded PhumData
- Maps: Google Maps Platform
- Local infrastructure: Docker Compose

## Development rules

1. Read AGENTS.md and relevant files under docs/context before implementation.
2. Produce an implementation plan before large changes.
3. Do not modify files under docs/original.
4. Do not modify project requirements or architecture documents without approval.
5. Keep TypeScript strict.
6. Do not place business logic inside controllers or React components.
7. Never expose secrets to client-side code.
8. Never commit .env files, credentials, or service account files.
9. Gemini is not a cultural source of truth.
10. Public cultural claims must be grounded in published PhumData.
11. Add tests for business rules and error paths.
12. Run lint, test, and build before declaring work complete.
13. Do not implement multiple business domains in one task.
14. Do not introduce microservices, Redis, queues, or WebSockets without approval.
15. Do not create production cloud resources or incur costs without approval.

## Local ports

- Web: 3000
- API: 3001
- PostgreSQL: 5432

## Development order

1. Sprint 0: repository and local development foundation
2. Sprint 1: PhumData core
3. Sprint 2: public heritage experience
4. Sprint 3: heritage map
5. Sprint 4: AI cultural scanner
6. Sprint 5: quiz and passport
7. Sprint 6: contribution and moderation
8. Sprint 7: Olympiad
