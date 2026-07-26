# Libraries

## Purpose

This file inventories installed libraries and observed usage in the ProDriver v2 codebase. It separates framework/runtime dependencies from UI, data, external service, and utility packages.

## Framework and Runtime

| Library | Version | Observed role |
| --- | --- | --- |
| `next` | `16.0.10` | App Router framework, pages, layouts, route handlers, server actions. |
| `react` | `19.2.0` | UI runtime and component state. |
| `react-dom` | `19.2.0` | Browser rendering. |
| `typescript` | `^5` | Type checking and TS/TSX source. |
| `ts-node` | `^10.9.2` | Prisma seed and TypeScript utility scripts. |

## Database and ORM

| Library | Version | Observed role |
| --- | --- | --- |
| `prisma` | `6.19.2` | Schema, generate, seed tooling. |
| `@prisma/client` | `6.19.2` | Prisma client dependency. App runtime mostly imports generated client from `generated/prisma-client`; some scripts import `@prisma/client`. |

## Authentication, Security, Validation

| Library | Version | Observed role |
| --- | --- | --- |
| `bcryptjs` | `^3.0.3` | Password hashing and verification. |
| `jose` | `^6.1.3` | HS256 JWT signing and verification. |
| `zod` | `3.25.76` | Installed for schema validation; not heavily observed in core flows. |
| `@hookform/resolvers` | `^3.10.0` | Form validation integration, part of shadcn/form stack. |
| `react-hook-form` | `^7.60.0` | Form library, mainly available through UI stack. |

Native Node crypto is used for AES-256-CBC encryption in `lib/security.ts` and `lib/encryption.ts`.

## Storage and Files

| Library | Version | Observed role |
| --- | --- | --- |
| `@aws-sdk/client-s3` | `^3.980.0` | Cloudflare R2 S3-compatible client. |
| `@aws-sdk/s3-request-presigner` | `^3.980.0` | Presigned PUT URLs for browser uploads. |
| `archiver` | `^7.0.1` | Module ZIP export route. |
| `adm-zip` | `^0.5.16` | Installed ZIP utility; not central in active route inventory. |

## AI and Speech

| Library | Version | Observed role |
| --- | --- | --- |
| `openai` | `^6.17.0` | Module translation generation and verification scripts. |
| `microsoft-cognitiveservices-speech-sdk` | `^1.47.0` | Azure Speech text-to-speech generation for module audio. |

## Styling and Design System

| Library | Version | Observed role |
| --- | --- | --- |
| `tailwindcss` | `^4.1.9` | Utility CSS framework. |
| `@tailwindcss/postcss` | `^4.1.9` | Tailwind 4 PostCSS integration. |
| `postcss` | `^8.5` | CSS build pipeline. |
| `autoprefixer` | `^10.4.20` | CSS prefixing. |
| `tw-animate-css` | `1.3.3` | Animation utilities imported by global CSS. |
| `tailwindcss-animate` | `^1.0.7` | shadcn animation dependency. |
| `tailwind-merge` | `^3.3.1` | Class merging in `lib/utils.ts`. |
| `clsx` | `^2.1.1` | Conditional class assembly in `lib/utils.ts`. |
| `class-variance-authority` | `^0.7.1` | shadcn component variants. |
| `next-themes` | `^0.4.6` | Theme package installed for shadcn patterns. |

## UI Components

### Radix UI

Installed Radix packages:

- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

Observed usage:

- shadcn UI components in `components/ui`.
- Dialogs, popovers, calendar/date range, dropdowns, buttons, forms, tables, tabs, sliders, toasts.

### Other UI Libraries

| Library | Version | Observed role |
| --- | --- | --- |
| `lucide-react` | `^0.454.0` | Primary icon set across admin, user, player, module editor. |
| `framer-motion` | `^12.29.0` | Animations, tab transitions, dialogs, reorder interactions. |
| `sonner` | `^1.7.4` | Toast notifications. |
| `cmdk` | `1.0.4` | Command/search UI in shadcn command component and module loading dialog. |
| `vaul` | `^1.1.2` | Drawer component dependency. |
| `input-otp` | `1.4.1` | OTP UI dependency. |
| `embla-carousel-react` | `8.5.1` | Carousel UI dependency. |
| `react-resizable-panels` | `^2.1.7` | Resizable panel dependency. |
| `nextjs-toploader` | `^3.9.17` | Top page loading bar in root layout. |
| `@vercel/analytics` | `1.3.1` | Installed analytics package; not prominent in active layouts. |

## Charts and Reports

| Library | Version | Observed role |
| --- | --- | --- |
| `recharts` | `2.15.4` | Admin dashboard charts, reports, module analytics. |
| `date-fns` | `4.1.0` | Date formatting in reports, audit logs, exports, backup names. |
| `react-day-picker` | `9.8.0` | Date range picker in reports. |
| `html-to-image` | `^1.11.13` | Browser-side report DOM capture for PDF export. |
| `html2canvas` | `^1.4.1` | Installed DOM capture library; not central in observed report path. |
| `jspdf` | `^4.1.0` | Browser-side PDF report generation. |

## Training Player

| Library | Version | Observed role |
| --- | --- | --- |
| `canvas-confetti` | `^1.9.4` | Success celebration after passing assessment. |
| `framer-motion` | `^12.29.0` | Player transitions and sequence-sorter drag/reorder. |
| `lucide-react` | `^0.454.0` | Player controls and element icons. |

## shadcn Component Files Present

`components/ui` contains a broad shadcn set:

- Accordion, alert, alert dialog, aspect ratio, avatar, badge, breadcrumb.
- Button, button group.
- Calendar, card, carousel, chart, checkbox.
- Collapsible, command, context menu.
- Dialog, drawer, dropdown menu.
- Empty, field, form.
- Hover card, input, input group, input OTP.
- Item, kbd, label.
- Menubar, navigation menu.
- Pagination, popover, progress.
- Radio group, resizable, scroll area, select, separator, sheet.
- Sidebar, skeleton, slider, sonner, spinner.
- Switch, table, tabs, textarea.
- Toast, toaster.
- Toggle, toggle group, tooltip.
- `use-mobile`, `use-toast`.

## Type Packages

Installed type helpers:

- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@types/adm-zip`
- `@types/archiver`
- `@types/bcryptjs`
- `@types/canvas-confetti`

## Libraries to Keep for EuclidPro

High-value to keep:

- Next.js, React, TypeScript.
- Prisma and PostgreSQL.
- Tailwind plus shadcn/Radix if the team wants fast, accessible UI primitives.
- Lucide icons.
- Recharts if dashboards remain chart-heavy.
- R2-compatible S3 SDK if Cloudflare R2 remains storage.
- OpenAI and Azure Speech if multilingual generation/audio remains a product feature.

## Libraries to Reconsider

- `html-to-image`, `html2canvas`, and `jspdf`: useful, but browser PDF export is fragile for complex chart pages. Consider server-side report generation for stable enterprise reporting.
- Duplicate/unused shadcn components: install only what EuclidPro actually uses.
- `adm-zip` vs `archiver`: choose one ZIP strategy.
- `next-themes`: keep only if theme switching exists.
- `@vercel/analytics`: keep only if analytics is configured.

## Dependency Risks

- Some installed libraries are part of a broad generated shadcn/v0 stack and may not be active.
- Dynamic Tailwind class construction like `bg-${color}-500` can fail purging/content detection unless safelisted or replaced with explicit class maps.
- `@prisma/client` imports in scripts conflict with custom generated client output.
- The current package name is `my-v0-project`, not product-specific.
