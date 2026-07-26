# ProDriver System Architecture & Technical Specifications (`working.md`)

This document outlines the detailed architecture, security models, encryption standards, authentication pipelines, role-based access controls, database models, and dual-dashboard system design of the **ProDriver Safety Command Center**.

---

## 1. High-Level Architecture Overview

The system is structured as a full-stack Next.js 16 application leveraging React 19 Client and Server Components, Server Actions for mutation pipelines, and API route handlers for background operations.

```
                  +-------------------------------------------------+
                  |              Client Browser / PWA               |
                  +-----------------------+-------------------------+
                                          |
                                    HTTPS / TLS 1.3
                                          |
                  +-----------------------v-------------------------+
                  |         Next.js Middleware (middleware.ts)      |
                  |   - HSTS, X-Frame-Options, CSP, Referrer      |
                  |   - Session Token Verification (jose HS256)    |
                  |   - RBAC Validation (ADMIN vs BASIC)            |
                  +-----------------------+-------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
     +-------------v-------------+                 +-------------v-------------+
     |   Admin Command Center    |                 |        Driver HUD         |
     |        (/admin)           |                 |    (/(user) & /dashboard) |
     | - Fleet KPIs & Radar      |                 | - Safety Training Modules |
     | - User Management & Import|                 | - Interactive Quizzes     |
     | - Audit Trail & Logs      |                 | - Digital Certificates    |
     +-------------+-------------+                 +-------------+-------------+
                   |                                             |
                   +----------------------+----------------------+
                                          |
                                    Server Actions
                                          |
                  +-----------------------v-------------------------+
                  |           Security & Data Layer                 |
                  |  - AES-256-CBC Field Encryption (crypto)        |
                  |  - bcryptjs Password Hashing                    |
                  |  - Prisma 6 ORM Engine                          |
                  +-----------------------+-------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
     +-------------v-------------+                 +-------------v-------------+
     |   PostgreSQL Database     |                 |  AWS S3 / Cloudflare R2   |
     |  - Users, Modules, Logs   |                 | - Presigned Upload URLs   |
     |  - Training Assignments   |                 | - Asset Storage           |
     +---------------------------+                 +---------------------------+
```

---

## 2. Security & Cryptography Architecture

### A. Encryption at Rest (AES-256-CBC)
Field-level sensitive data encryption is executed using Node.js native `crypto` routines (`lib/encryption.ts` & `lib/security.ts`).

- **Cipher Algorithm**: `aes-256-cbc`
- **Key Generation**: 32-byte secret key configured via environment variable `AES_SECRET` (falling back to strict 32-character buffer in development).
- **Initialization Vector (IV)**: A fresh 16-byte random IV (`crypto.randomBytes(16)`) is generated for every encryption call to prevent rainbow table and pattern analysis attacks.
- **Ciphertext Storage Format**: `IV_HEX:ENCRYPTED_HEX` (e.g., `a1b2c3d4...:e5f6g7h8...`).
- **Decryption Pipeline**: Splitting string by delimiter `:`, extracting `ivHex` and `encryptedHex`, rebuilding IV buffer, and streaming through decipher object.

```typescript
// Sample AES Encryption Logic
export function encryptData(text: string): string {
    if (!text) return text;
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", Buffer.from(AES_SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}
```

---

### B. Encryption in Transit & HTTP Hardening (TLS / HTTPS)
Network-level security is enforced centrally within `middleware.ts` on every incoming web request.

1. **HTTP Strict Transport Security (HSTS)**:
   - Header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - Forces all browser communication over encrypted TLS/HTTPS channels for 1 full year across all subdomains.
2. **Clickjacking Protection**:
   - Header: `X-Frame-Options: DENY`
   - Prevents embedding the application inside external iframes.
3. **MIME Sniffing Prevention**:
   - Header: `X-Content-Type-Options: nosniff`
4. **Referrer & Feature Policies**:
   - Header: `Referrer-Policy: strict-origin-when-cross-origin`
   - Header: `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

### C. Authentication & Session Architecture
User authentication is built on stateless, cryptographically signed JSON Web Tokens (JWT) using the `jose` library (`lib/jwt.ts`).

- **Signature Algorithm**: `HS256` (HMAC with SHA-256).
- **Signing Key**: Encoded secret key (`SESSION_SECRET` environment variable).
- **Expiration Policy**: 7 days (`.setExpirationTime("7d")`).
- **Cookie Storage**: Stored in HTTP-only, secure, same-site `session_token` cookie, preventing client-side JavaScript access and XSS token extraction.
- **Password Security**: Passwords stored in `users.password_hash` using `bcryptjs` salted hashes (salt rounds = 10).

---

## 3. Role-Based Access Control (RBAC) & Authorization

The system implements strict Role-Based Access Control using native Prisma Enums:

```prisma
enum Role {
  BASIC
  ADMIN
}
```

### Authorization Enforcement Layers:

1. **Middleware Enforcement (`middleware.ts`)**:
   - Inspects requests targeting protected route prefixes (e.g., `/admin*`).
   - Extracts `session_token` from cookies and verifies token integrity.
   - Rejects unauthenticated users with a 302 redirect to `/login`.
   - Validates user role payload (`payload.role === 'ADMIN'`). Unprivileged users attempting to access admin routes are rerouted to `/dashboard`.

2. **Server Action & API Level Authorization**:
   - Server Actions check user sessions via `getSession()` before executing DB reads or mutations.

```typescript
// Middleware RBAC Implementation Snippet
const isProtectedPath = ADMIN_PATHS.some(prefix => path.startsWith(prefix));
if (isProtectedPath) {
    const token = request.cookies.get('session_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    const payload = await verifySession(token);
    if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
}
```

---

## 4. Shadow Account & Impersonation Subsystem

To facilitate admin audits, debugging, and testing without altering primary driver data, the system includes a **Shadow Account Mechanism**:

```prisma
model User {
  id               String   @id @default(cuid())
  is_test_account  Boolean  @default(false)
  linked_parent_id String?
  linked_parent    User?    @relation("AdminShadow", fields: [linked_parent_id], references: [id])
  shadow_accounts  User[]   @relation("AdminShadow")
}
```

- **Mechanism**: Admins can spawn or switch into linked shadow accounts (`is_test_account = true`).
- **Visual Alerting**: When active in impersonation mode, an amber warning banner (`ImpersonationBanner`) is rendered fixed at the top of the user viewport:
  - Displays "Admin Impersonation Mode Active".
  - Provides a single-click "Revert to Admin" button calling `revertImpersonation()`.

---

## 5. Dual Dashboard Architectures

The project features two distinct user interface domains built for separate user personas:

### A. Admin Command Center (`/admin`)
Designed for fleet operations, safety compliance officers, and system administrators.

- **Hero Header & Filter Bar**: Real-time fleet performance data status indicators with dynamic multi-company filter tabs (`Internal (Mowasalat)`, `Contractors`, `Unified View`).
- **Fleet Analytics Widgets**:
  - `RiskRadar`: 5-axis safety risk analysis (speeding, fatigue, distraction, compliance, braking).
  - `TrainingChart`: Area & Bar charts depicting monthly completion rates and assigned vs completed modules.
  - `IncidentsChart`: High-density timeline of fleet safety incidents and severity distribution.
- **User & Fleet Management (`/admin/users`)**: Batch CSV import (`user-import.ts`), manual user creation modals, department/designation/team assignments, and shadow account generation.
- **Module Builder (`/admin/modules`)**: Rich content creation tool for publishing safety training modules and associating quizzes.
- **Audit Logs (`/admin/audit`)**: Event log table tracking all administrative actions with actor metadata.

### B. Driver / User Dashboard (`/dashboard` & `/(user)`)
Mobile-optimized, low-bandwidth driver safety portal.

- **Multilingual Support**: Supports 16+ languages (English, Arabic, Hindi, Urdu, Bengali, Tagalog, Swahili, Chinese, Pashto, Malayalam, Tamil, Telugu, etc.) with dynamic LTR / RTL layout switching (`dir="rtl"`).
- **Safety Training HUD**: Carousel-based slide viewer (`embla-carousel-react`) for reviewing assigned safety materials.
- **Interactive Testing & Certification**:
  - Multiple choice quizzes with real-time scoring.
  - Automatic PDF certificate generation (`jspdf`) upon passing mark attainment.
  - Victory particle effects (`canvas-confetti`).
- **Driver Profile Modal**: View employee ID, department, vehicle assignments, and language settings.

---

## 6. Database Models & Prisma ORM Schema

The persistence layer uses Prisma 6 connected to PostgreSQL. Key relational entities:

- **`User`**: Central user identity model storing hashed credentials, roles (`Role`), company, preferred language, shadow linkage, and location relationships.
- **`Module`**: Content entity (`ModuleType`: `TRAINING` or `TEST`), duration, total marks, pass marks, and slide JSON content.
- **`TrainingAssignment`**: Join entity mapping `User` to `Module` with completion tracking (`TrainingStatus`, `TestStatus`, `marks_obtained`, `certificate_id`).
- **`Notification`**: System notifications scoped by `userId` or `targetRole`.
- **`AuditLog`**: Audit trail storing actor ID, action, timestamp, and JSON metadata.
- **Master Data (`Department`, `Team`, `Designation`, `Location`)**: Structural organizational hierarchy models.

---

## 7. Cloud Storage & External AI Integrations

### AWS S3 / Cloudflare R2 Storage (`lib/r2.ts`)
- Presigned URL generation (`@aws-sdk/s3-request-presigner`) allowing client browsers to directly upload large video/pdf assets to object storage securely without bottlenecking Next.js server threads.

### AI & Speech SDK Integration (`lib/openai.ts` & `lib/OpenAI_Prompt.ts`)
- OpenAI client instance configured for automated safety translation generation across non-English driver dialects.
- Microsoft Cognitive Services Speech SDK integration for audio-guided voice prompts during driver safety quizzes.
