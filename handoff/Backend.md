# Backend

## Purpose

This file reverse engineers the backend implementation in ProDriver v2. The backend is mostly implemented through Next.js server actions plus Prisma, with two API route handlers.

## Backend Architecture Summary

Backend layers:

- `app/actions/*`: primary business logic.
- `app/api/*`: small HTTP route surface.
- `lib/*`: infrastructure clients and shared helpers.
- `prisma/schema.prisma`: data model.
- `prisma/seed.ts`: seed data.
- `scripts/*`: operational/debug scripts.

Main external dependencies:

- PostgreSQL through Prisma.
- Cloudflare R2 through AWS S3-compatible SDK.
- OpenAI for translation.
- Azure Speech for audio.
- JWT cookie sessions with `jose`.
- Password hashing with `bcryptjs`.

## Data Model

### Enums

`Role`:

- `BASIC`
- `ADMIN`

`TrainingStatus`:

- `NOT_STARTED`
- `ONGOING`
- `COMPLETED`

`TestStatus`:

- `NOT_STARTED`
- `ONGOING`
- `PASSED`
- `FAILED`

`LocationType`:

- `HOME`
- `ASSIGNED`

`ModuleType`:

- `TRAINING`
- `TEST`

### User

Mapped table:

- `users`

Key fields:

- `id`: cuid primary key.
- `employee_id`: unique employee login id.
- `password_hash`: nullable. Null means pending/inactive account.
- `role`: `BASIC` or `ADMIN`.
- `full_name`.
- `company`.
- `email`.
- `mobile_number`.
- `preferred_language`.
- `is_test_account`.
- `linked_parent_id`.
- `department_id`.
- `team_id`.
- `designation_id`.
- `home_location_id`.
- `assigned_location_id`.
- timestamps.

Relations:

- Self relation for admin shadow accounts.
- Department.
- Team.
- Designation.
- Home location.
- Assigned location.
- Assignments received.
- Assignments given.
- Notifications.
- Audit logs.

Notes:

- Login uses `employee_id`.
- Session payload stores `employee_id` as `userId`.
- Some code names the database id as `mongoId`, a legacy naming artifact.

### Module

Mapped table:

- `modules`

Key fields:

- `id`: autoincrement integer primary key.
- `title`.
- `slug`: unique.
- `content`: JSON.
- `is_published`.
- `description`.
- `file_source`: required.
- `thumbnail_url`.
- `total_marks`.
- `pass_marks`.
- `duration_minutes`.
- `is_active`.
- `type`: `TRAINING` or `TEST`.
- `linked_module_id`.
- timestamps.

Relations:

- Assignments.
- Self relation for linked modules.

Notes:

- Module content is stored in the database and also saved to R2 as `content.json`.
- The module editor supports training and assessment inside one content object, even though the database also has a `ModuleType` and linked module mechanism.

### TrainingAssignment

Mapped table:

- `training_assignments`

Key fields:

- `id`: cuid primary key.
- `user_id`.
- `module_id`.
- `assigned_by_id`.
- `assigned_date`.
- `due_date`.
- `training_status`.
- `test_status`.
- `current_slide`.
- `marks_obtained`.
- `completion_date`.
- `certificate_id`.
- `updatedAt`.

Constraints:

- Unique `[user_id, module_id]`.
- User and module relations cascade on delete.

Notes:

- This is the central progress record.
- Some frontend code refers to `completed_date`, but schema uses `completion_date`.

### Master Data

Models:

- `Team`: `teams`.
- `Department`: `departments`.
- `Designation`: `designations`.
- `Location`: `locations`.

Location type:

- `HOME`: depot/home base.
- `ASSIGNED`: operational site/work-zone.

Notes:

- The code sometimes labels departments as teams in UI/action filters.
- User model has both `department_id` and `team_id`; current analytics often use `department`.

### AuditLog

Mapped table:

- `audit_logs`

Fields:

- `id`.
- `action`.
- `actor_id`.
- `target_id`.
- `metadata`: JSON.
- `timestamp`.

### Notification

Mapped table:

- `notifications`

Fields:

- `id`.
- `type`: string, expected `CRITICAL`, `OPERATIONAL`, or `INFO`.
- `title`.
- `message`.
- `isRead`.
- `userId`: optional direct user target.
- `targetRole`: optional role target.
- `link`.
- `metadata`.
- `createdAt`.

## Infrastructure Helpers

### Prisma

File:

- `lib/prisma.ts`

Behavior:

- Imports `PrismaClient` from `../generated/prisma-client`.
- Creates a singleton Prisma client.
- Stores it on global in non-production.
- Recreates if a stale generated client appears to lack `notification`.

Risk:

- Some scripts import `@prisma/client` directly. This conflicts with the custom Prisma client output.

### JWT

Files:

- `lib/jwt.ts`
- `lib/security.ts`

Behavior:

- Uses `jose`.
- Algorithm: HS256.
- Session duration: 7 days.
- Secret source: `SESSION_SECRET`.

Risk:

- Both files implement JWT helpers.
- Fallback secret exists: `super-secret-key-change-me-in-prod`.

### Encryption

Files:

- `lib/encryption.ts`
- `lib/security.ts`

Behavior:

- AES-256-CBC.
- Secret source: `AES_SECRET`.

Risk:

- Duplicate encryption helpers.
- Fallback secret exists.
- Signup encrypts email/mobile, but read paths generally do not decrypt those fields, so admin UI may display ciphertext for self-registered users.

### R2

File:

- `lib/r2.ts`

Behavior:

- Creates S3-compatible R2 client.
- Region: `auto`.
- Endpoint derived from `R2_ACCOUNT_ID`.

### OpenAI

File:

- `lib/openai.ts`

Behavior:

- Creates OpenAI client.
- Model from `OPENAI_MODEL`.
- Fallback model: `codex-5.3`.

### Language Constants

File:

- `lib/languages.ts`

Content:

- Supported language list.
- RTL metadata.
- UI translations.

Supported language codes:

- `en`, `ar`, `hi`, `ur`, `bn`, `tl`, `ne`, `ml`, `ta`, `te`, `kn`, `or`, `si`, `ps`, `ro`, `zh`, `sw`.

## API Routes

### POST /api/storage/sign

File:

- `app/api/storage/sign/route.ts`

Input:

- `filename`.
- `fileType`.
- `folder`.

Behavior:

- Creates an R2 object key.
- Generates presigned PUT URL.
- Returns:
  - `uploadUrl`.
  - `publicUrl`.

Used by:

- `utils/uploadToR2.ts`.

### GET /api/modules/export

File:

- `app/api/modules/export/route.ts`

Input:

- Query param `id`.

Behavior:

- Loads module by id.
- Creates ZIP with `archiver`.
- Includes `module-{slug}.json`.
- Streams response as attachment.

Used by:

- Module provision editor export button.

## Auth Server Actions

File:

- `app/actions/auth.ts`

### loginUser

Inputs:

- `employeeId`.
- `password`.

Behavior:

- Finds user by `employee_id`.
- Requires password hash.
- Compares password with bcrypt.
- Signs JWT.
- Sets `session_token` cookie.
- Returns role and user id.

Redirect behavior is handled in frontend.

### logoutUser

Behavior:

- Deletes `session_token`.

Note:

- Some UI logout buttons route to `/login` without calling this action.

### getSession

Behavior:

- Reads `session_token`.
- Verifies JWT.
- Returns session payload:
  - `userId`.
  - `role`.
  - `dbId`.
  - impersonation metadata when present.

### verifyCurrentPassword

Behavior:

- Gets current session.
- Loads user.
- Compares supplied password.

Used by:

- Publish dialog and security-sensitive admin flows.

### registerUser

Behavior:

- Refuses duplicate employee id.
- Hashes password.
- Encrypts mobile/email.
- Creates BASIC user.
- Signs in user immediately.

### setLanguageCookie

Behavior:

- Sets `NEXT_LOCALE` for one year.

### impersonateShadowAccount

Behavior:

- Requires admin session.
- Verifies target shadow account belongs to admin.
- Issues 1-hour BASIC session with original admin metadata.

### exitImpersonation

Behavior:

- Restores admin session from impersonation metadata.

## User Actions

### app/actions/user.ts

Functions:

- Get current user profile by employee id.
- Update profile fields.
- Change password.
- Fetch user details for signup/autofill.

Notes:

- Location update appears limited or ignored depending on payload.
- Reads usually operate by employee id from session.

### app/actions/signup-options.ts

Behavior:

- Returns designations.
- Returns teams.
- Returns HOME depots.
- Returns ASSIGNED locations.

### app/actions/getDriverTrainings.ts

Behavior:

- Receives database user id.
- Finds assignments for that user.
- Includes module data.

### app/actions/driver-training.ts

Functions:

- `completeTrainingAction`.
- `completeTestAction`.

Training completion:

- Sets `training_status = COMPLETED`.
- Sets completion date.

Test completion:

- Loads module pass marks.
- Sets `test_status = PASSED` or `FAILED`.
- Sets marks.
- On failure, resets training:
  - `training_status = NOT_STARTED`.
  - `completion_date = null`.
- If failure rate exceeds threshold, creates an admin critical notification.

## Admin Dashboard Actions

### app/actions/getAdminStats.ts

Inputs:

- Company filter.

Behavior:

- Counts users, assignments, modules.
- Computes completion rate.
- Computes pending assessments.
- Computes training and test status distributions.
- Builds monthly trend data.
- Builds risk radar data.
- Returns recent activity.

Notes:

- Recent activity is currently hardcoded mock data.
- Company filtering distinguishes internal Mowasalat, contractors, and all.

## User Management Actions

### app/actions/getUsers.ts

Behavior:

- Loads active users.
- Loads pending users.
- Excludes `is_test_account`.
- Includes team, designation, home location, assigned location, and assignments.
- Enriches with training stats.
- Marks `has_password`.

### app/actions/user-management.ts

Functions:

- Load dropdown/form options.
- Create user.
- Reset password.
- Fetch shadow accounts.
- Create shadow account.

Create user:

- Uses default password `Welcome@123`.

Reset password:

- Generates simple fallback from employee/name pattern.

Shadow account:

- Generates employee id like `TST-{adminEmployeeId}-NN`.
- Uses password `Welcome@123`.
- Links shadow to admin.

### app/actions/user-import.ts

Flow:

- Creates presigned CSV import upload path.
- Processes mapped CSV rows.
- Creates users with `password_hash = null` so they are pending.
- Maps names to teams, designations, depots, assigned locations.
- Creates admin notification if import has errors.

Default company:

- Mowasalat.

## Module Repository Actions

### app/actions/modules.ts

Functions:

- `getModules`.
- `getModuleAnalytics`.

getModules:

- Returns modules ordered by title.
- Includes assignment count.

getModuleAnalytics:

- Loads assignments for a module.
- Groups users by:
  - department/team label.
  - home depot.
  - assigned location.
- Returns counts and total assignment count.

## Module Editor Actions

File:

- `app/actions/module-editor.ts`

This is the largest backend action file.

### Storage Helpers

`renameR2Folder(oldPrefix, newPrefix)`:

- Copies R2 objects from old prefix to new prefix.
- Deletes old objects after copy.

`getPresignedUrlAction(filename, fileType, context)`:

- Returns presigned PUT URL.
- Context-aware keys:
  - `<moduleId>/<training|test>/image/<filename>`
  - fallback `modules/<timestamp>-<filename>`.

`uploadModuleAssetAction(formData, context)`:

- Uploads server-side to R2.
- Context-aware key:
  - `<moduleId>/<training|test>/image/<clean filename>`.
  - fallback `assets/<timestamp>-<filename>`.

### Audio

`VOICE_MAP`:

- Maps supported languages to Azure Neural voices.

`generateAudioAssets(text, lang, context)`:

- Uses Azure Speech.
- Uploads generated mp3 to R2.
- Context path:
  - `<moduleId>/<mode>/audio/<slideIndex>_<LANG>.mp3`.

`generateAllBlockAudio(moduleId, mode)`:

- Iterates module slides.
- Iterates text/quiz elements.
- Iterates languages.
- Generates per-element audio:
  - `<moduleId>/<mode>/audio/<slideIdx>_<element.id>_<LANG>.mp3`.

### Translation Files

`uploadTranslationFile`:

- Saves source or language JS files to R2.
- Current naming:
  - `<id>_<name>_<training|test>_Tmp_EN.js`
  - `Languages.js`

### Module CRUD and Recovery

`getAvailableModules`:

- Lists modules for load dialog.

`getNextModuleId`:

- Calculates next id.

`saveModule`:

- Creates or updates a module record.
- Serializes complete content.
- Uploads R2 `<moduleId>/content.json`.
- Updates `file_source`.
- Handles publish state.
- Revalidates relevant paths.
- On publish, creates BASIC notification.

`createLinkedModule`:

- Creates linked module relationship for training/test pair.

`getModule`:

- Loads module by id.
- If database content is missing/empty, attempts R2 recovery:
  - `content.json`.
  - legacy file source.

`importModule`:

- Imports module payload into current schema.

`getAudioConfig`:

- Returns audio-related config for the module editor.

`generateModuleTranslations`:

- Writes source export to R2.
- Calls OpenAI chat completions with strict JSON response.
- Saves returned translations.
- Returns parsed JSON to UI.

## Assignment Actions

File:

- `app/actions/assignments.ts`

Constants:

- Page size: 15 for assignment list.

Functions:

- `getModules`.
- `getAssignments`.
- `getUserAssignmentDetails`.
- `createAssignments`.
- `bulkAssign`.
- `getUsersForAssignment`.
- `deleteAssignment`.

### getAssignments

Filters:

- Search.
- Training statuses.
- Module ids.
- Team ids (field was `departmentIds` prior to the fix commit; now correctly named `teamIds` in `AssignmentFilters` interface).
- Designation ids (added alongside the team rename; previously absent).
- Depot ids.
- Assigned location ids.

Returns:

- Assignment rows.
- User fields and relations.
- Module fields.
- Pagination.

### createAssignments

Input:

- user ids.
- module ids.
- optional due date.

Behavior:

- Creates assignment rows with `createMany`.
- Uses `skipDuplicates`.
- Revalidates paths.
- Creates direct BASIC notifications for each user.

### getUsersForAssignment

Filters:

- Search.
- Team (mapped from UI's `selectedDepts` state variable to `teamIds` API field).
- Designation (new filter added with the team rename fix).
- Depot.
- Assigned location.

Behavior:

- Excludes test accounts.
- Returns assignable users.

### deleteAssignment

Behavior:

- Deletes assignment by id.

## Master Data Actions

File:

- `app/actions/master-data.ts`

Functions:

- `getMasterData`.
- `manageTeam`.
- `deleteTeam`.
- `manageDesignation`.
- `deleteDesignation`.
- `manageLocation`.
- `deleteLocation`.

Behavior:

- Loads teams, designations, and locations with user counts.
- Upserts or updates records by id/name.
- Deletes records.

Risk:

- Deleting a master-data item linked to users can fail due to relational constraints. UI warns but backend handling should be explicit in EuclidPro.

## Notification Actions

File:

- `app/actions/notifications.ts`

Functions:

- `getNotifications`.
- `markAsRead`.
- `createNotification`.

getNotifications behavior:

- Accepts optional user id and role.
- If user id is an employee id, resolves it to database id.
- Returns direct user notifications, role notifications, and broadcast-like notifications.
- Takes latest 20.
- Returns unread count.

## Audit Actions

File:

- `app/actions/audit.ts`

Behavior:

- Paginated audit log search.
- Page size: 20.
- Filters:
  - search.
  - start date.
  - end date.
- Includes actor name/email/role.

## Report Actions

File:

- `app/actions/reports.ts`

Functions:

- `getReportStats`.
- `getDrillDownData`.
- `getFilterOptions`.

### getReportStats

Inputs:

- Date range.
- Depot id.
- Team id.
- Designation id.

Returns:

- Summary:
  - total workforce.
  - active components.
  - average score.
  - global pass rate.
- Training status stats.
- Test status stats.
- Module performance (per-module average score and attempt count).
- Depot stats (completed/total/percentage per depot).
- Team stats (completed/total/percentage per team).
- Designation stats (completed/total/percentage per designation — added when designation filter was introduced).

### getDrillDownData

Observed supported categories include:

- `training_status`.
- `test_status`.
- `inactive_users`.

Risk:

- Frontend charts expose more conceptual categories than the backend fully implements. EuclidPro should define drill-down contracts per chart explicitly.

### getFilterOptions

Returns:

- Depots.
- Teams.
- Designations.

## CSV Export Actions

File:

- `app/actions/csv-export.ts`

Functions:

- `exportUsersCSV`.
- `exportModulesCSV`.
- `exportAssignmentsCSV`.
- `exportAuditLogsCSV`.

Notes:

- CSVs are returned as strings to the browser.
- Browser creates Blob download.
- Module month sorting currently returns `0`, so months are not actually sorted.

## Middleware

File:

- `middleware.ts`

Behavior:

- Adds security headers to most non-static routes.
- Protects `/admin` paths.
- Redirects unauthenticated admin access to `/login`.
- Redirects non-admin users from admin to `/dashboard`.

Security headers:

- `X-Frame-Options`.
- `X-Content-Type-Options`.
- `Referrer-Policy`.
- `Permissions-Policy`.
- `Content-Security-Policy`.

Matcher excludes:

- `api`.
- `_next/static`.
- `_next/image`.
- `favicon.ico`.

Risk:

- User dashboard/player are not middleware-protected; they rely on page checks.

## Seed Data

File:

- `prisma/seed.ts`

Creates:

- Departments.
- Teams.
- Designations.
- Home and assigned locations.
- 10 modules.
- Admin user:
  - employee id `ADMIN001`.
  - password `password123`.
- 50 drivers.
- Randomized assignments.
- Audit logs.

Risk:

- Seed output shows mojibake/encoding artifacts in console strings.
- Hardcoded sample admin password should remain development-only.

## Operational Scripts

### scripts/backup-db.ts

Behavior:

- Reads `DATABASE_URL`.
- Runs `pg_dump`.
- Gzips SQL dump.
- Uploads to R2 path `DB_Backup/<date>.sql.gz`.
- Deletes local dump.

Risk:

- Uses shell command construction for `pg_dump`.
- Requires local `pg_dump` and `gzip`.

### scripts/setup-cors.js

Behavior:

- Reads `.env` manually.
- Applies R2 bucket CORS:
  - allowed methods: PUT, GET, HEAD, POST, DELETE.
  - allowed origins: `*`.

Risk:

- Broad CORS is convenient for development but should be narrowed in production.

### scripts/verify-keys.js

Behavior:

- Tests OpenAI by sending a small chat completion.
- Tests R2 by writing `connectivity-check.txt`.

Note:

- Console output has mojibake symbols.

### scripts/test-translation-pipeline.ts

Behavior:

- Tests R2 upload.
- Tests OpenAI JSON translation response.

### Debug/verification scripts

Files:

- `check_db.js`
- `check-notifs.ts`
- `verify-seed.ts`
- `scripts/debug-users.ts`
- `scripts/debug-users-file.ts`

Purpose:

- Local troubleshooting of database/user/notification/seed state.

Risk:

- Some scripts import the wrong Prisma client path.

## Environment Variables

Observed keys:

- `DATABASE_URL`
- `DIRECT_URL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_DOMAIN`
- `R2_API_TOKEN`
- `R2_ENDPOINT`
- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `SESSION_SECRET`
- `AES_SECRET`
- `NODE_ENV`

Secret values were not read into the handoff.

## Current Backend Risks

- Server actions are broad and UI-coupled.
- Auth utilities are duplicated.
- Encryption utilities are duplicated.
- Required secrets have unsafe fallbacks.
- User route protection is inconsistent.
- Prisma client import path is inconsistent between app and scripts (`seed.ts` still imports from `@prisma/client`).
- R2 storage key conventions mix current and legacy formats.
- Module model mixes database JSON, R2 snapshots, legacy JS files, linked modules, and training/test sections.
- OpenAI model label in UI can differ from backend model.
- `completion_date`/`completed_date` mismatch appears in multiple frontend flows.
- Reports drill-downs are not fully aligned with all chart categories.
- CSV and PDF generation are implemented in a minimal browser-friendly way, not robust reporting infrastructure.
- Reference-only and active code live in the same repository.
- Assignment filter naming was partially fixed: `AssignmentFilters` now uses `teamIds` and `designationIds`, but the `AssignmentManager` UI state variable is still named `selectedDepts` (maps to `teamIds` at the action call site).

## Suggested EuclidPro Backend Boundaries

### Core Services

Create explicit backend service modules:

- `AuthService`
- `UserService`
- `AssignmentService`
- `ModuleAuthoringService`
- `PublishedModuleService`
- `TrainingRuntimeService`
- `NotificationService`
- `ReportService`
- `AuditService`
- `MasterDataService`
- `StorageService`
- `TranslationService`
- `SpeechService`

### Database Boundary

Keep Prisma behind service/repository functions. Avoid importing Prisma directly into UI-facing server actions except at the service layer.

### Module Boundary

Separate:

- Authoring draft content.
- Published immutable module version.
- Runtime assignment/progress state.
- Generated assets.
- Translation jobs.
- Audio jobs.

### Auth Boundary

Use one session module. Require secrets at startup. Ensure logout always clears the cookie. Apply route protection uniformly.

### Storage Boundary

Use versioned paths:

```text
modules/{moduleId}/draft/{version}/...
modules/{moduleId}/published/{version}/...
modules/{moduleId}/assets/...
modules/{moduleId}/audio/{lang}/...
imports/users/...
backups/database/...
```

### Reporting Boundary

Define chart contracts and drill-down contracts together so every visual segment has a matching backend query.
