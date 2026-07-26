# Connections

## Purpose

This file maps the working connection surfaces in the current ProDriver v2 codebase so the EuclidPro rebuild can preserve the useful boundaries while simplifying the implementation.

The analysis is code-level. Credentials were not tested and secret values were not exposed.

## Runtime Topology

```text
Browser
  -> Next.js App Router pages and layouts
  -> Client components
  -> Server Actions in app/actions/*
  -> Prisma client in lib/prisma.ts
  -> PostgreSQL database

Browser uploads
  -> app/api/storage/sign
  -> Cloudflare R2 presigned PUT
  -> R2 public URL saved into module content

Admin module editor
  -> Server actions in app/actions/module-editor.ts
  -> PostgreSQL Module records
  -> Cloudflare R2 content.json, media, translations, audio
  -> OpenAI translation generation
  -> Azure Speech audio generation

Training player
  -> Module content from PostgreSQL
  -> Media/audio from R2 public domain
  -> Server actions to update TrainingAssignment progress/results
```

## Frontend to Backend Connections

### Next.js Pages

The app uses the Next.js App Router. Pages under `app/` call server actions directly or render client components that call server actions.

Active route groups:

- `/`: user language gateway from `app/(user)/page.tsx`.
- `/login`: user/admin login and signup from `app/(user)/login/page.tsx`.
- `/dashboard`: authenticated user training dashboard from `app/(user)/dashboard/page.tsx`.
- `/play/[moduleId]`: training/test player from `app/(user)/play/[moduleId]/page.tsx`.
- `/admin`: admin command dashboard from `app/admin/page.tsx`.
- `/admin/users`: user management.
- `/admin/modules`: module repository and analytics.
- `/admin/modules/provision`: module maker/editor/generator.
- `/admin/assignments`: assignment overview and bulk assignment.
- `/admin/reports`: report analytics.
- `/admin/audit`: audit log browser.
- `/admin/master-data`: teams, designations, depots, work-zones.

### Server Actions

Most backend behavior is implemented as server actions, not as REST routes.

- `app/actions/auth.ts`: login, logout, session, password verification, registration, language cookie, impersonation.
- `app/actions/user.ts`: user profile read/update/password change and signup autofill.
- `app/actions/signup-options.ts`: dropdown options for signup.
- `app/actions/getDriverTrainings.ts`: user dashboard assignment list.
- `app/actions/driver-training.ts`: training completion and test completion.
- `app/actions/getAdminStats.ts`: admin dashboard KPI/chart data.
- `app/actions/getUsers.ts`: active/pending user lists and training stats.
- `app/actions/user-management.ts`: admin user CRUD helpers, password resets, shadow accounts.
- `app/actions/user-import.ts`: CSV user import staging and processing.
- `app/actions/modules.ts`: module repository list and analytics.
- `app/actions/module-editor.ts`: module authoring, import/export, publishing, translations, media, audio.
- `app/actions/assignments.ts`: assignment listing, filtering, creation, deletion, details.
- `app/actions/master-data.ts`: teams, designations, locations.
- `app/actions/reports.ts`: report summary, chart data, drill-down data, filter options.
- `app/actions/audit.ts`: paginated audit logs.
- `app/actions/notifications.ts`: notification listing and read state.
- `app/actions/csv-export.ts`: CSV exports for users, modules, assignments, audit logs.

### API Routes

Only two explicit route handlers exist.

- `app/api/storage/sign/route.ts`: accepts upload metadata and returns a Cloudflare R2 presigned PUT URL plus a public URL.
- `app/api/modules/export/route.ts`: accepts `?id=...`, loads a module, and streams a ZIP containing `module-{slug}.json`.

## Database Connection

### Technology

- Database provider: PostgreSQL.
- ORM: Prisma.
- Schema file: `prisma/schema.prisma`.
- Runtime Prisma entrypoint: `lib/prisma.ts`.
- Generated Prisma client output: `generated/prisma-client`.

### Environment Variables

Code expects:

- `DATABASE_URL`: main PostgreSQL connection URL.
- `DIRECT_URL`: direct PostgreSQL URL for Prisma migrations/generate paths.

### Prisma Runtime Pattern

`lib/prisma.ts` imports from `../generated/prisma-client`, creates a singleton Prisma client, and stores it on `global` outside production. It also contains a runtime recovery path if the generated client appears stale and lacks `notification`.

### Prisma Client Inconsistency

Most app code imports `prisma` from `@/lib/prisma`, which uses the generated client in `generated/prisma-client`. Some scripts import `@prisma/client` directly even though the schema generator points elsewhere. EuclidPro should standardize on one generated client path.

## Core Data Connections

### User

`User` stores authentication identity, profile fields, role, master-data links, language preference, and shadow-account relationships.

Important links:

- `User.department_id -> Department.id`
- `User.team_id -> Team.id`
- `User.designation_id -> Designation.id`
- `User.home_location_id -> Location.id`
- `User.assigned_location_id -> Location.id`
- `User.linked_parent_id -> User.id`
- `User.assignments_received -> TrainingAssignment[]`
- `User.notifications -> Notification[]`
- `User.audit_actions -> AuditLog[]`

### Module

`Module` stores authoring metadata, published status, module content JSON, assessment marks, duration, type, and optional self-link for training/test module pairing.

Important links:

- `Module.assignments -> TrainingAssignment[]`
- `Module.linked_module_id -> Module.id`
- R2 content file under `<moduleId>/content.json`.
- R2 legacy/generated files under `<moduleId>/...`.

### TrainingAssignment

`TrainingAssignment` is the main join table between users and modules. It tracks training status, test status, current slide, marks, due date, completion date, and optional certificate id.

Important links:

- `TrainingAssignment.user_id -> User.id`
- `TrainingAssignment.module_id -> Module.id`
- `TrainingAssignment.assigned_by_id -> User.id`
- Unique constraint on `[user_id, module_id]`.

### Notifications

Notifications can target:

- A specific user through `userId`.
- A role through `targetRole`.
- Both direct and role-targeted messages are read by `getNotifications`.

### Audit

Audit logs attach an `actor_id` to a user and optionally store a `target_id` plus JSON metadata.

## Authentication and Session Connections

### Login

`loginUser(employeeId, password)`:

1. Finds the user by `employee_id`.
2. Requires `password_hash`.
3. Compares password with `bcryptjs`.
4. Signs a JWT with `jose`.
5. Stores it in an httpOnly `session_token` cookie.

JWT payload fields:

- `userId`: employee id, not database id.
- `role`: `BASIC` or `ADMIN`.
- `mongoId`: actually the Prisma database user id.
- Optional impersonation fields for shadow-account mode.

### Middleware

`middleware.ts` applies security headers and protects `/admin` routes.

Admin flow:

- Missing/invalid `session_token` redirects to `/login`.
- Non-admin role redirects to `/dashboard`.
- API/static/image/favicon paths are excluded.

User routes are not protected by middleware. User dashboard and player pages handle session checks in page code.

### Impersonation

Admin shadow accounts are stored as `User` rows with:

- `is_test_account = true`
- `linked_parent_id = admin.id`
- generated employee id like `TST-{adminEmployeeId}-NN`

Switching into a shadow account rewrites `session_token` with role `BASIC` and original admin metadata. `exitImpersonation` restores the admin token.

## Storage Connections

### Cloudflare R2

Runtime client:

- `lib/r2.ts`
- AWS SDK S3-compatible client.
- Endpoint format: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`.

Expected environment variables:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_DOMAIN`
- `R2_API_TOKEN`
- `R2_ENDPOINT`

Observed R2 uses:

- Module content snapshots: `<moduleId>/content.json`.
- Module source/translations: `<id>_<safeName>_<training|test>_Tmp_EN.js`, `Languages.js`.
- Uploaded media: `<moduleId>/<training|test>/image/<filename>`.
- Audio: `<moduleId>/<training|test>/audio/<slideIndex>_<LANG>.mp3`.
- Element audio: `<moduleId>/<training|test>/audio/<slideIndex>_<elementId>_<LANG>.mp3`.
- CSV import uploads: `imports/users/<timestamp>-<filename>`.
- Database backup script: `DB_Backup/<yyyy-mm-dd>.sql.gz`.

### Client Upload Flow

`utils/uploadToR2.ts`:

1. Calls `POST /api/storage/sign`.
2. Receives `uploadUrl` and `publicUrl`.
3. Uploads the file with `PUT uploadUrl`.
4. Returns `publicUrl`.

The module editor also has direct server-side upload through `uploadModuleAssetAction(formData, context)`.

## AI and Speech Connections

### OpenAI

Runtime client:

- `lib/openai.ts`

Expected environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Default model in code:

- `codex-5.3`

Observed uses:

- `generateModuleTranslations` in `app/actions/module-editor.ts`.
- `scripts/verify-keys.js`.
- `scripts/test-translation-pipeline.ts`.

Prompt files:

- `lib/OpenAI_Prompt.ts`: module translation prompt for safety training content.
- `lib/OpenAI_UI_Translation_Prompt.ts`: UI translation prompt.

Important note: `TranslationManager` labels the UI button as `GPT4o-mini`, but the server action uses `OPENAI_MODEL`. The displayed model name can be misleading.

### Azure Speech

Runtime dependency:

- `microsoft-cognitiveservices-speech-sdk`.

Expected environment variables:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Observed uses:

- `generateAudioAssets`
- `generateAllBlockAudio`

Voice mapping includes English, Arabic, Hindi, Urdu, Malayalam, Tamil, Telugu, Kannada, Bengali, Pashto, Sinhala, Odia, Nepali, Filipino, Romanian, Chinese, and Swahili.

## Notification Connections

Notification sources observed:

- Module publish creates a BASIC notification for a new training module.
- Assignment creation creates direct BASIC notifications for selected users.
- Test failures can create ADMIN critical notifications when failed attempts cross a threshold.

Notification UI:

- Admin header polls `getNotifications(undefined, 'ADMIN')` every 30 seconds.
- User header polls/loads BASIC/user notifications through `NotificationsDropdown`.
- Clicking a notification marks it as read and may route to `link`.

## Reporting and Export Connections

### CSV Exports

Server actions generate CSV strings and client components create browser downloads.

- Users: active/pending/all user exports.
- Modules: month-wise completion counts.
- Assignments: assignment report.
- Audit logs: full audit log export.

### PDF Report Export

`ReportsDashboard` uses:

- `html-to-image` to capture report DOM nodes.
- `jspdf` to create a landscape PDF.

This is entirely browser-side and depends on rendered chart DOM state.

## Asset Connections

Public assets used:

- `/mowasalat-logo.png`
- `/background.mp3`
- `/icon.svg`
- `/apple-icon.png`
- `/placeholder-*`

Potential missing reference:

- `components/admin-dashboard/dynamic-background.tsx` references `/grid.svg`, but the current `public/` inventory does not include `grid.svg`.

## Animation Utility

`lib/animation-utils.ts` exports `getRandomEntryAnimation`, a Framer Motion variants factory that standardizes slide-up entry animations.

Used by:

- `components/user-dashboard/module-player.tsx`
- `components/admin-dashboard/module-editor/mobile-simulator.tsx`

EuclidPro should keep or replace this with a shared animation token system rather than per-component constants.

## Reference and Legacy Connections

`reference_only/` contains older source trees and data files, including older Next.js/API implementations and dashboard prototypes. These should be treated as reference material, not active runtime code.

`components/user-dashboard/dashboard/` contains several static/older dashboard components. The active `/dashboard` route currently mixes two subfolder components (`dashboard/hero-title` and `dashboard/footer-action`) with active root components (`main-content`, `header`). Other files under that subfolder appear unused by active routes.

## Connection Risks to Address in EuclidPro

- Standardize Prisma client generation and imports.
- Protect user routes consistently in middleware or route-level server guards.
- Replace fallback JWT/AES secrets with required environment validation.
- Use one auth/session helper instead of duplicated JWT and AES utilities.
- Separate module authoring storage from published runtime storage.
- Make R2 asset keys deterministic and versioned.
- Add explicit API/service boundaries instead of many client components directly importing server actions.
- Fix naming mismatch around `completion_date` vs `completed_date`.
- Remove or quarantine legacy/reference component trees from production source.
- Make model names and prompt contracts explicit in UI and backend config.
