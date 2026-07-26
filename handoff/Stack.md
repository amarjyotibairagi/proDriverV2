# Stack

## Executive Summary

ProDriver v2 is a Next.js 16 App Router application with React 19, TypeScript, Prisma/PostgreSQL, Tailwind CSS 4, shadcn/Radix UI components, Cloudflare R2 object storage, OpenAI translation generation, and Azure Speech audio generation.

It is effectively a full-stack monolith:

- Frontend pages, client components, and admin/user dashboards live in `app/` and `components/`.
- Backend business logic mostly lives in server actions under `app/actions/`.
- Only two explicit HTTP API routes exist.
- Data persistence uses PostgreSQL through Prisma.
- Module media, translation files, generated audio, imports, and backups use R2.

## Application Framework

- Framework: Next.js `16.0.10`.
- Routing: App Router.
- React: `19.2.0`.
- React DOM: `19.2.0`.
- Language: TypeScript.
- Rendering model:
  - Server pages for initial authenticated data loading.
  - Client components for most dashboard interactions.
  - Server actions imported directly into client components for mutations and data fetches.
  - Explicit `force-dynamic` on several dashboard routes.

## Package Scripts

From `package.json`:

- `npm run dev`: `next dev`.
- `npm run build`: `prisma generate && next build`.
- `npm run start`: `next start`.
- `npm run lint`: `eslint .`.

Prisma seed command:

- `npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts`

## Configuration

### next.config.mjs

Current settings:

- `typescript.ignoreBuildErrors = true`.
- `images.unoptimized = true`.

Rewrite note:

- `ignoreBuildErrors` lets production builds pass with TypeScript problems. EuclidPro should remove this after tightening types.
- `images.unoptimized` avoids Next image optimization, likely because R2/public image handling is external or deployment-specific.

### tsconfig.json

Current characteristics:

- Strict mode enabled.
- No emit.
- Module resolution: bundler.
- JSX: react-jsx.
- Path alias: `@/* -> ./*`.
- Includes source files plus `.next/types`.

### components.json

shadcn configuration:

- Style: `new-york`.
- RSC: true.
- TSX: true.
- Icon library: `lucide`.
- Tailwind CSS path configured as `app/globals.css`.

Actual active CSS files:

- Root layout imports `app/user-globals.css`.
- Admin layout imports `app/admin-globals.css`.
- There is no active `app/globals.css` in the route inventory, so `components.json` points to a stale/default path.

## Styling and UI System

### Tailwind

- Tailwind CSS 4 via `@tailwindcss/postcss`.
- CSS files import `tailwindcss` and `tw-animate-css`.
- `tailwind-merge` and `clsx` are wrapped in `lib/utils.ts` as `cn`.

### Global Themes

`app/user-globals.css`:

- Uses shadcn-compatible CSS variables.
- Defines custom scrollbars.
- Visual palette: dark operational background with teal and gold accents.
- Includes a `scan` keyframe and `fadeIn`.

`app/admin-globals.css`:

- Dark theme by default.
- Variables for background, foreground, card, popover, primary teal, accent amber, charts, warning, and sidebar colors.
- Defines `.glass-card`, glow helpers, emergency pulse, and gradient text.

### Visual Direction

Current visual system:

- Dark, high-contrast dashboards.
- Glassmorphism cards and panels.
- Teal as primary operational color.
- Amber/gold as safety and accent color.
- Framer Motion interactions.
- Lucide icons throughout.
- Recharts for analytics.

Rewrite note:

- The app leans heavily on large radii, glow effects, and decorative background motion. EuclidPro can keep the operational palette while making dense admin screens cleaner and less dependent on one-off effects.

## Data Layer

### ORM and Database

- Prisma `6.19.2`.
- PostgreSQL datasource.
- Generated client output: `generated/prisma-client`.
- Runtime singleton: `lib/prisma.ts`.

### Main Models

- `User`
- `Module`
- `TrainingAssignment`
- `Team`
- `Department`
- `Designation`
- `Location`
- `AuditLog`
- `Notification`

### Enums

- `Role`: `BASIC`, `ADMIN`
- `TrainingStatus`: `NOT_STARTED`, `ONGOING`, `COMPLETED`
- `TestStatus`: `NOT_STARTED`, `ONGOING`, `PASSED`, `FAILED`
- `LocationType`: `HOME`, `ASSIGNED`
- `ModuleType`: `TRAINING`, `TEST`

## Backend Style

### Primary Pattern

The backend is server-action-first. Client components call imported functions from `app/actions/*`.

Benefits:

- Simple local full-stack development.
- No large REST controller layer.
- Server actions keep code close to pages/components.

Costs:

- Business logic is spread across many action files.
- Client components know too much about backend functions.
- Harder to version contracts for a rewrite.
- Shared behavior like auth, encryption, and uploads is duplicated in places.

### API Routes

Only explicit route handlers:

- `POST /api/storage/sign`
- `GET /api/modules/export`

## Authentication Stack

- Password hashing: `bcryptjs`.
- JWT signing/verifying: `jose`.
- Session cookie: `session_token`.
- Cookie options:
  - httpOnly.
  - sameSite lax.
  - secure in production.
  - 7-day max age for normal login.

Auth implementation files:

- `app/actions/auth.ts`.
- `lib/jwt.ts`.
- `lib/security.ts`.

Rewrite note:

- Auth helpers are duplicated. `lib/jwt.ts` and `lib/security.ts` both implement JWT behavior.
- `SESSION_SECRET` has a fallback string. EuclidPro should fail startup if the secret is missing.
- User routes are not uniformly middleware-protected.

## External Services

### Cloudflare R2

Used as S3-compatible object storage for:

- Module content snapshots.
- Module media.
- Generated audio.
- Translation files.
- User import files.
- Database backup script.

SDK:

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

### OpenAI

Used for:

- Module content translation generation.
- Translation pipeline tests.

SDK:

- `openai`

### Azure Speech

Used for:

- Text-to-speech generation for slides/elements.

SDK:

- `microsoft-cognitiveservices-speech-sdk`

## Module Authoring Stack

The module maker combines:

- Client-side editor state.
- Server actions for persistence.
- Prisma `Module.content` JSON.
- R2 `content.json` snapshots.
- R2 media uploads.
- OpenAI translations.
- Azure generated audio.
- A mobile simulator preview.

The authoring schema in `app/admin/modules/provision/types.ts` supports:

- Text blocks.
- Images.
- Icons.
- Videos.
- Quizzes.
- Image sliders.
- Sequence sorter interactions.
- Split-second decision interactions.
- Training and assessment sections.
- Per-language translations.

## Reporting Stack

Reports combine:

- Prisma aggregate queries in server actions.
- Recharts for visualizations.
- Route search params for filters.
- `html-to-image` and `jspdf` for PDF export.
- CSV export server actions for tabular downloads.

## Build and Generated Files

Observed generated/runtime folders:

- `.next/`: Next.js build/dev output.
- `node_modules/`: dependencies.
- `generated/prisma-client/`: Prisma generated client.
- `tsconfig.tsbuildinfo`: TypeScript incremental state.

Rewrite note:

- Generated/client output location is custom. Keep it intentional if retained, and update scripts and imports consistently.

## Reference Material

`reference_only/` contains:

- Older app implementations.
- Dashboard prototypes.
- Older route handler implementations.
- Language and training samples.
- A file named `API_KEYS.txt`.

It should not be treated as active runtime source. EuclidPro should keep reference artifacts outside the production source tree and never commit secret files.

## Root-Level Artifacts

The root folder includes active configuration plus historical/planning/debug files.

Active or configuration files:

- `.env`: environment variables; values were not exposed in this handoff.
- `middleware.ts`: route protection and security headers.
- `package.json` and `package-lock.json`: npm dependency and lock files.
- `next.config.mjs`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `postcss.config.mjs`: Tailwind/PostCSS pipeline.
- `components.json`: shadcn configuration.
- `prisma/`: schema and seed.
- `generated/prisma-client/`: generated Prisma client and engines.

Planning/reference files:

- `project_details.txt`: high-level LMS purpose and an intended architecture/component breakdown. Some content is descriptive/planning-oriented and does not exactly match current implementation.
- `api_reference.md`: REST API reference extracted from an older `reference_only` project. Current app mostly uses server actions instead of these routes.
- `action.md`: original schema-generation prompt/instructions.
- `AI_RULES.md`: design system notes for a cyberpunk-corporate HSE dashboard style.

Debug/sample files:

- `content-output.json`: large sample module content/slide JSON.
- `debug-output.txt`: captured database/user debug output.
- `check_db.js`, `check-notifs.ts`, `verify-seed.ts`: local verification scripts.
- `tsconfig.tsbuildinfo`: generated TypeScript incremental build cache.

Generated-client note:

- `generated/prisma-client/` contains many Prisma engine/temp files. EuclidPro should decide whether generated Prisma output belongs in source control and should clean stale temp engine files if they are not intentionally tracked.

## Structural Map

```text
app/
  (user)/                 User routes: language, login, dashboard, player
  admin/                  Admin routes and module provision editor
  actions/                Server actions, main backend logic
  api/                    Two HTTP route handlers
  layout.tsx              Root layout
  user-globals.css        User-side global theme
  admin-globals.css       Admin-side global theme

components/
  admin-dashboard/        Admin shell, dashboard, modules, users, reports, audit
  user-dashboard/         User login/dashboard/player components
  ui/                     shadcn/Radix UI components

lib/
  prisma.ts               Prisma singleton
  jwt.ts                  JWT helper
  security.ts             JWT plus AES helper
  encryption.ts           AES helper
  r2.ts                   R2 client
  openai.ts               OpenAI client
  languages.ts            UI languages/translations
  animation-utils.ts      Framer Motion entry animation helper (getRandomEntryAnimation); used by MobileSimulator and ModulePlayer
  OpenAI_*.ts             Translation prompts

prisma/
  schema.prisma           Database schema
  seed.ts                 Seed data

scripts/
  backup-db.ts
  setup-cors.js
  verify-keys.js
  test-translation-pipeline.ts
  debug/verification scripts
```

## EuclidPro Stack Recommendations

- Keep Next.js App Router if the product remains a web-first full-stack app.
- Keep Prisma/PostgreSQL for structured users, assignments, audit, notifications, and module metadata.
- Keep R2 or equivalent object storage for media/audio, but define a clean published asset contract.
- Split module authoring JSON from runtime module JSON.
- Replace fallback secrets with strict environment validation.
- Add a backend service layer between UI and Prisma.
- Consolidate all auth, encryption, and session code.
- Move legacy/reference projects outside active source.
- Remove `ignoreBuildErrors` and address type mismatches during the rebuild.
