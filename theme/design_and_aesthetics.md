# Design Philosophies, Aesthetics & Theme Guide

## 3. Design Philosophies

The application adopts a **Cyberpunk Glassmorphism Command Center** design philosophy. It is designed to look like a high-tech tactical safety dashboard and fleet control system.

### Core Architectural Principles:
1. **High Contrast Dark Aesthetics**:
   - Deep slate/midnight backgrounds (`#020617`, `#0a1a18`, `#0f172a`) paired with vibrant neon accents (`#2BB5A8` / `#14b8a6` teal, `#D4AF37` gold, emerald green, indigo, and amber).
2. **Layered Depth & Glassmorphism**:
   - Use of semi-transparent dark container panels (`bg-black/40`, `bg-[#0f172a]/80`), combined with heavy backdrop blur (`backdrop-blur-md`, `backdrop-blur-xl`) and subtle 1px metallic borders (`border border-white/10`, `border-[#D4AF37]/20`).
3. **Tactical Command Typography & Accents**:
   - All-caps, wide letter-spacing (`tracking-[0.4em]`), italicized tags, and terminal badge iconography (`Terminal`, `Activity`, `ShieldAlert`) giving a real-time HUD feel.
4. **Contextual Role Separation**:
   - **Admin Command Center (`/admin`)**: High-density data grid layout, analytics hero section, real-time fleet filters, and control popups.
   - **Driver HUD (`/dashboard`)**: Mobile-first responsive layout, simplified touch targets, large status indicators, and multilingual accessibility.

---

## 4. UI-Related Dependencies & Usage

| Library / Primitive | Version | How & Where Used |
| :--- | :--- | :--- |
| **Tailwind CSS v4** | `^4.1.9` | Primary style engine using inline OKLCH theme variables (`@theme inline`) for colors, radiuses, and dynamic theme tokens. |
| **Radix UI Primitives** | `^1.1.4` | Low-level unstyled accessibility primitives wrapped inside styled components in `components/ui/*` (Dialogs, Popovers, Accordions, Dropdowns, Tabs). |
| **Framer Motion** | `^12.29.0` | Fluid layout animations, smooth modal popups, sliding tab indicators (`layoutId="headerFilterTab"`), entry staggers, and floating banners. |
| **Lucide React** | `^0.454.0` | Vector icon system integrated into navigation items, status pills, metrics cards, and command buttons. |
| **Sonner** | `^1.7.4` | Toast notification provider mounted in root `layout.tsx` for alert feedback. |
| **NextTopLoader** | `^3.9.17` | Route change indicator featuring a neon teal top progress bar (`#14b8a6`) with glowing shadow effects. |
| **Embla Carousel** | `8.5.1` | Used for interactive slide content in user learning modules. |
| **Vaul** | `^1.1.2` | Mobile-friendly bottom drawer component for bottom sheet menus. |
| **Canvas Confetti** | `^1.9.4` | Victory particle animation triggered on test completion and certificate unlocks. |

---

## 5. Design Philosophy and Integration

The UI components are architected into three distinct layers:

1. **Design System Tokens (`app/user-globals.css` & `app/admin-globals.css`)**:
   - Centralized CSS variable definitions using `oklch()` color spaces.
   - Utility class bindings (`.glass-card`, `.custom-scrollbar`) for uniform look-and-feel across all routes.

2. **Atomic UI Primitives (`components/ui/*`)**:
   - Standardized reusable components built with `class-variance-authority` (cva), `clsx`, and `tailwind-merge`.
   - Ensures accessibility standards while guaranteeing consistent border radius (`--radius: 0.625rem`), typography, and hover effects.

3. **Domain Dashboards (`components/admin-dashboard/*` & `components/user-dashboard/*`)**:
   - Feature-specific UI layouts (e.g., `Header`, `RiskRadar`, `TrainingChart`, `IncidentsChart`, `NotificationsDropdown`, `UserProfilePopup`).

---

## 6. What is Used for Graphs

Data visualization throughout the application is powered by **Recharts** (`v2.15.4`), wrapped in a custom design system component (`components/ui/chart.tsx`).

### Graph Implementations & Chart Types:
1. **Fleet Risk Radar Chart (`components/admin-dashboard/risk-radar.tsx`)**:
   - Recharts `<RadarChart>` & `<Radar>` components displaying multi-dimensional risk scores (Speeding, Fatigue, Distraction, Compliance, Braking) with teal fill (`#2BB5A8`) and semi-transparent opacity.
2. **Training Progress Area & Bar Charts (`components/admin-dashboard/training-chart.tsx`)**:
   - Recharts `<ResponsiveContainer>` rendering monthly training completion rates and module engagement.
3. **Incidents Trend Chart (`components/admin-dashboard/incidents-chart.tsx`)**:
   - Recharts `<AreaChart>` with custom SVG linear gradients (`#14b8a6` to `transparent`) showing safety trends over time.
4. **Module Analytics (`components/admin-dashboard/modules/module-stats.tsx`)**:
   - Recharts `<BarChart>` with custom tooltips (`ChartTooltip`) and legends (`ChartLegend`).

---

## 7. Animation and Background Page Aesthetics

### Background Aesthetics:
- **Root Background**: Slate 950 / Deep Space Noir (`bg-[#020617]`).
- **Ambient Glow Effects**: Absolute positioned radial background light sources with high blur filters:
  ```tsx
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
  <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
  ```
- **Glassmorphism Panels**:
  ```css
  bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 shadow-2xl
  ```

### Animations:
1. **Framer Motion Layout Variants**:
   - Staggered child list entry transitions (`staggerChildren: 0.1`).
   - Smooth animated tab highlight using `layoutId="headerFilterTab"` with spring physics (`bounce: 0.2, duration: 0.6`).
2. **CSS Keyframe Animations (`user-globals.css`)**:
   - `@keyframes fadeIn`: Smooth opacity and `translateY(10px)` rise for dynamic content loads.
   - `@keyframes scan`: Vertical line sweep effect simulating tactical scanning.
3. **Hover & Interactive Micro-animations**:
   - Scaling pills (`hover:scale-105`), gradient shine sweeps across logos (`group-hover:translate-x-[100%] transition-transform duration-1000`), and border color transitions.

---

## 8. Fonts Used

The application relies on Next.js font optimization (`next/font/google`) importing **Geist** and **Geist Mono**:

```tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
```

### Font Fallback System:
- **Sans-serif Font**: `'Geist', 'Geist Fallback', system-ui, sans-serif`
- **Monospace Font**: `'Geist Mono', 'Geist Mono Fallback', monospace`

### Typography Hierarchy:
- **Hero Headers**: `font-black uppercase italic tracking-tighter text-4xl sm:text-5xl`
- **Section Badges**: `font-black text-[10px] uppercase tracking-[0.4em] italic text-slate-400`
- **Body & Data Text**: `font-medium text-slate-200 text-xs sm:text-sm`

---

## 9. Detailed Theme Specification (For Theme Replication)

To reproduce this theme in another application, use the following tokens and CSS variables:

### Light & Dark OKLCH Color Palette (`user-globals.css`):

```css
@import 'tailwindcss';
@import 'tw-animate-css';

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

### Signature Hex Brand Colors:
- **Primary Teal Accent**: `#2BB5A8` / `#14b8a6`
- **Gold Metallic Accent**: `#D4AF37`
- **Deep Slate Background**: `#020617` / `#0a1a18` / `#0f172a`
- **Success Emerald**: `#10b981`
- **Warning Amber**: `#f59e0b`
- **Danger Rose**: `#f43f5e`
