# Software Stack & Dependency Analysis

## 1. The Software Stack

The application **ProDriver Safety Command Center** is built using a modern full-stack web application architecture based on Next.js 16 (App Router) and React 19.

### Core Stack Architecture:
- **Framework & Web Server**: Next.js 16.0.10 (React Server Components, App Router, Server Actions, Dynamic API Routes)
- **Frontend Core**: React 19.2.0 & React DOM 19.2.0
- **Language**: TypeScript 5 (Strict Mode enabled, TS node compilation)
- **Database & ORM**: Prisma ORM 6.19.2 connected to PostgreSQL (native ENUM types, relational constraints, schema migration system)
- **Styling Engine**: Tailwind CSS v4 (`@tailwindcss/postcss` 4.1.9, PostCSS 8, tw-animate-css)
- **State Management & Data Flow**: Server Actions, React hooks (`useState`, `useEffect`, `useRef`), URL Search Parameters for filter state, and Context/Providers.

---

## 2. Dependencies and Libraries Used

Below is the complete inventory of production and development dependencies categorized by their domain and usage in the codebase.

### Core Framework & Runtime
- `next` (`16.0.10`): Full-stack framework handling SSR, SSG, API routes, middleware, and image optimization.
- `react` (`19.2.0`) & `react-dom` (`19.2.0`): Core UI library for component tree rendering.
- `typescript` (`^5`): Provides static type checking and IntelliSense across server and client code.
- `@types/node`, `@types/react`, `@types/react-dom`: Type definitions for Node.js and React.

### Database & ORM
- `@prisma/client` (`6.19.2`): Auto-generated database client for querying models (`User`, `Module`, `TrainingAssignment`, `AuditLog`, `Notification`, etc.).
- `prisma` (`6.19.2`): CLI tool for migrations, schema management, and seeding (`npx ts-node prisma/seed.ts`).
- `ts-node` (`^10.9.2`): Executable script runner for running TypeScript Prisma seed files.

### UI Components & Accessibility Primitives
- `@radix-ui/react-*` (`Accordion`, `Alert-Dialog`, `Aspect-Ratio`, `Avatar`, `Checkbox`, `Collapsible`, `Context-Menu`, `Dialog`, `Dropdown-Menu`, `Hover-Card`, `Label`, `Menubar`, `Navigation-Menu`, `Popover`, `Progress`, `Radio-Group`, `Scroll-Area`, `Select`, `Separator`, `Slider`, `Slot`, `Switch`, `Tabs`, `Toast`, `Toggle`, `Toggle-Group`, `Tooltip`): Headless, accessible UI primitives for accessible dialogs, menus, tooltips, dropdowns, and form inputs.
- `cmdk` (`1.0.4`): Fast, unstyled command menu component.
- `vaul` (`^1.1.2`): Drawer primitive component for mobile modal experiences.
- `embla-carousel-react` (`8.5.1`): Fluid carousel component for slide modules and image galleries.
- `input-otp` (`1.4.1`): Accessible OTP/pin input field component.
- `react-day-picker` (`9.8.0`): Flexible date picker component for scheduling and reports.
- `react-resizable-panels` (`^2.1.7`): Resizable layout grid panels.

### Styling, Design Tokens & Utilities
- `tailwindcss` (`^4.1.9`): Utility-first CSS framework (v4 engine using CSS native `@import 'tailwindcss'`).
- `@tailwindcss/postcss` (`^4.1.9`): PostCSS plugin for compilation of Tailwind v4.
- `postcss` (`^8.5`): Tool for transforming CSS with JavaScript.
- `tw-animate-css` (`1.3.3`) & `tailwindcss-animate` (`^1.0.7`): Animation utilities for Tailwind CSS.
- `clsx` (`^2.1.1`): Constructing `className` strings conditionally.
- `tailwind-merge` (`^3.3.1`): Merging Tailwind CSS classes without style conflicts.
- `class-variance-authority` (`^0.7.1`): Creating reusable component variants with type safety.
- `next-themes` (`^0.4.6`): Theme management (dark/light theme switching with CSS variables).

### Motion & Visual Effects
- `framer-motion` (`^12.29.0`): Production-ready motion engine powering layout transitions, modal popups, floating banners, and spring physics.
- `canvas-confetti` (`^1.9.4`) & `@types/canvas-confetti`: Confetti particle animations upon quiz completion or module milestone achievements.
- `lucide-react` (`^0.454.0`): Modern vector icon library (e.g., `Terminal`, `Activity`, `ShieldAlert`, `Globe`, `Calendar`, `Users`, `Building`).
- `nextjs-toploader` (`^3.9.17`): Route transition progress bar mounted at the top of the viewport (`#14b8a6` teal color).
- `sonner` (`^1.7.4`): Toast notifications library.

### Graphing & Analytics
- `recharts` (`2.15.4`): Composability-driven chart library built on SVG for responsive data visualizations (Area, Bar, Pie, Radar, Line charts).

### Authentication, Security & Cryptography
- `jose` (`^6.1.3`): Lightweight JSON Web Signature (JWS) / JWT library for signing and verifying user session tokens (`HS256` algorithm).
- `bcryptjs` (`^3.0.3`) & `@types/bcryptjs`: Hashing and verifying user passwords (`bcrypt.hash`, `bcrypt.compare`).

### Validation & Forms
- `zod` (`3.25.76`): TypeScript-first schema declaration and validation library.
- `react-hook-form` (`^7.60.0`): High-performance form state management.
- `@hookform/resolvers` (`^3.10.0`): Zod resolver integration for `react-hook-form`.

### Cloud Storage, Speech & AI Services
- `@aws-sdk/client-s3` (`^3.980.0`) & `@aws-sdk/s3-request-presigner` (`^3.980.0`): AWS S3 / Cloudflare R2 object storage client for uploading/downloading training assets and presigned URLs.
- `openai` (`^6.17.0`): Client SDK for OpenAI API integration.
- `microsoft-cognitiveservices-speech-sdk` (`^1.47.0`): Azure Speech SDK for speech-to-text and text-to-speech features.

### Export & File Generation Utilities
- `html-to-image` (`^1.11.13`) & `html2canvas` (`^1.4.1`): Converting HTML DOM elements to raster images.
- `jspdf` (`^4.1.0`): Client-side PDF document generation.
- `adm-zip` (`^0.5.16`) & `archiver` (`^7.0.1`): Server-side ZIP creation and extraction utilities.
- `date-fns` (`4.1.0`): Date manipulation and formatting library.
