# Reverse Engineering Plan

## Scope

This handoff pass documents the existing Pro Driver v2 application so it can be rebuilt as EuclidPro from a clearer architecture. The work is documentation-only: no application source, configuration, schema, or runtime behavior will be changed.

## Deliverables

- `Connections.md`: Runtime connections and integration points between browser, Next.js routes, server actions, Prisma/database, storage, AI, speech, authentication, and middleware.
- `Stack.md`: Current technical stack, app structure, rendering model, build tooling, styling system, authentication model, data layer, and deployment-relevant configuration.
- `Libraries.md`: Installed libraries grouped by purpose with observed usage in the codebase.
- `Frontend.md`: Route-by-route and component-by-component frontend inventory, including user/admin login flows, dashboards, sidebar contents, page sections, and module/training generator UI.
- `Backend.md`: Backend surface area including Prisma schema, server actions, API route handlers, auth/session behavior, uploads, reporting, audit, assignments, modules, and scripts.

## Execution Steps

1. Inventory the repository structure, excluding generated dependency/build folders except where they reveal project behavior.
2. Read core metadata and configuration: `package.json`, `next.config.mjs`, `tsconfig.json`, `components.json`, middleware, environment usage, and Prisma files.
3. Trace backend connections and data flow through `lib/`, `app/actions/`, `app/api/`, Prisma schema/seed, and utility scripts.
4. Trace frontend route hierarchy through `app/`, layouts, pages, global styles, and dashboard/module components.
5. Extract UI content from admin and user dashboards: navigation labels, page sections, tables, filters, dialogs, cards, charts, and training/module editor controls.
6. Cross-check dependency usage with source imports so the stack and libraries documents distinguish installed packages from actually observed usage.
7. Write the handoff Markdown files with evidence-based details and explicit notes where implementation is incomplete, duplicated, generated, or reference-only.
8. Validate that every requested topic is covered and that no source files outside `handoff/` were modified.

## Revision Pass — 2026-06-05

A second review was performed against the live codebase to reconcile handoff content with post-initial-documentation changes. Files verified against: all `app/actions/*.ts`, `app/admin/modules/provision/types.ts`, `app/admin/reports/page.tsx`, `components/admin-dashboard/assignments/`, `components/admin-dashboard/module-editor/`, `components/admin-dashboard/reports/`, `components/admin-dashboard/users/`, `components/user-dashboard/module-player.tsx`, `lib/openai.ts`, `lib/animation-utils.ts`, `prisma/seed.ts`, `scripts/verify-keys.js`.

Changes applied:

- **Backend.md**: Updated `getAssignments` filters — `departmentIds` renamed to `teamIds`; `designationIds` added as new filter. Updated `getUsersForAssignment` to document designation filter. Updated `getReportStats` returns to include `designationStats`. Added assignment partial-rename risk note to risks section.
- **Frontend.md**: Updated `AssignmentManager` shared filters to document Designation addition and the `selectedDepts`→`teamIds` naming gap. Corrected `MediaUploader` to note it is a standalone file (`media-uploader.tsx`), not inline. Corrected `SlideEditor` to note it is exported from `slide-manager.tsx`. Updated `ReportsDashboard` to note `designationStats`.
- **Stack.md**: Added `lib/animation-utils.ts` to the structural map.
- **Connections.md**: Added Animation Utility section documenting `lib/animation-utils.ts` and its two consumers.
