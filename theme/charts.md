# ProDriver Chart Aesthetics & Component Specifications (`charts.md`)

This document provides pixel-level fidelity specifications for reproducing the charts, animations, tooltips, glassmorphism cards, gradients, and Recharts component implementations used in the **ProDriver Safety Command Center**.

---

## 1. Design Overview & Chart Architecture

ProDriver charts use **Recharts 2.15.4** combined with **Framer Motion** for entrance animations and **Tailwind CSS v4** glassmorphism card containers.

### Core Visual Features:
- **Card Enclosure**: Dark glassmorphic panels (`bg-[#0f172a]/95 glass-card rounded-[3rem] p-8 border border-white/10 backdrop-blur-3xl`).
- **SVG Glow Effects**: Custom SVG `<filter id="glow">` applying a 3px/5px Gaussian blur merged back onto the primary stroke (`feMergeNode`).
- **Ambient Radial Backdrops**: Positioned blurred radial gradient glows behind chart containers (`bg-teal-500/20 rounded-full blur-[120px]`).
- **Micro-Animations**: Framer Motion entry scale & fade (`initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}`), spring-animated tab indicators (`layoutId="activeChartTab"`), and Recharts stroke/fill entrance durations (1500ms - 2500ms).

---

## 2. Card & Chart CSS Styles (`admin-globals.css`)

```css
/* Glassmorphism Card Style */
.glass-card {
  @apply backdrop-blur-xl border border-white/10 shadow-xl;
  background: rgba(15, 23, 42, 0.5);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.glass-card:hover {
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

/* Accent Glows */
.glow-teal {
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
}

.glow-red {
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.glow-yellow {
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
}
```

---

## 3. Tooltip & Hover State Mechanics

All chart tooltips feature custom Framer Motion interactive popups:

- **Tooltip Container**: `bg-[#0f172a]/95 glass-card rounded-2xl p-5 border border-white/10 backdrop-blur-3xl shadow-2xl`
- **Animation Motion**: `initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}`
- **Typography**: Header text in `text-[10px] font-black uppercase tracking-[0.2em] text-slate-500`, data numbers in `text-2xl font-black text-white italic tracking-tighter`.

---

## 4. Light Mode Adaptation Spec

While ProDriver is designed dark-first (`#020617`), adapting to light mode requires the following token mappings:

| Property | Dark Mode (Default) | Light Mode Equivalent |
| :--- | :--- | :--- |
| **Card Background** | `rgba(15, 23, 42, 0.95)` | `rgba(255, 255, 255, 0.90)` |
| **Card Border** | `rgba(255, 255, 255, 0.10)` | `rgba(0, 0, 0, 0.08)` |
| **Axis Ticks (`XAxis`/`YAxis`)** | `#475569` / `#94a3b8` | `#64748b` / `#334155` |
| **Grid Lines (`CartesianGrid`)**| `rgba(255, 255, 255, 0.03)` | `rgba(0, 0, 0, 0.05)` |
| **Teal Primary Accent** | `#2dd4bf` / `#14b8a6` | `#0d9488` |
| **Amber/Gold Accent** | `#fbbf24` / `#eab308` | `#d97706` |
| **Rose Alert Accent** | `#f43f5e` | `#e11d48` |

---

## 5. Source Code: `components/ui/chart.tsx`

```tsx
'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip
const ChartLegend = RechartsPrimitive.Legend

export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
}
```

---

## 6. Source Code: `components/admin-dashboard/risk-radar.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AlertTriangle } from "lucide-react";

interface RiskData {
  subject: string;
  value: number;
  fullMark: number;
}

export function RiskRadar({ data }: { data?: RiskData[] }) {
  const chartData = data || [
    { subject: "Knowledge Gap", value: 45, fullMark: 100 },
    { subject: "Compliance", value: 85, fullMark: 100 },
    { subject: "Test Failures", value: 20, fullMark: 100 },
    { subject: "Backlog", value: 35, fullMark: 100 },
    { subject: "Recency", value: 75, fullMark: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/95 glass-card rounded-[3rem] p-8 h-full flex flex-col relative overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl transition-all duration-500"
    >
      {/* Background Pulse Glow */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100 uppercase italic tracking-tighter">
              Risk <span className="text-rose-500">Analysis</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">Risk Profile Overview</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={chartData}>
            <defs>
              <radialGradient id="riskGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8} />
              </radialGradient>
              <filter id="radar-glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <PolarGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#475569", fontSize: 9, fontWeight: "900", letterSpacing: "1px" }}
            />

            <Radar
              name="Risk Level"
              dataKey="value"
              stroke="url(#riskGradient)"
              strokeWidth={4}
              fill="#f43f5e"
              fillOpacity={0.1}
              style={{ filter: "url(#radar-glow)" }}
              animationDuration={2500}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#0f172a]/95 glass-card rounded-2xl p-5 border border-rose-500/30 backdrop-blur-3xl shadow-2xl"
                    >
                      <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em] mb-3 border-b border-rose-500/10 pb-2">
                        {payload[0].payload.subject}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                          <AlertTriangle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                            {payload[0].value}
                          </p>
                          <p className="text-[9px] text-slate-500 font-black uppercase mt-1">Risk Level Index</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
```

---

## 7. Source Code: `components/admin-dashboard/training-chart.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

interface TrainingChartProps {
  data?: number[]; // [completed, ongoing, pending]
}

export function TrainingChart({ data = [45, 20, 15] }: TrainingChartProps) {
  const chartData = [
    { name: "Completed", value: data[0], color: "#14b8a6" },
    { name: "Ongoing", value: data[1], color: "#eab308" },
    { name: "Not Started", value: data[2], color: "#64748b" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] h-full overflow-hidden relative"
    >
      <div className="mb-8 relative z-10">
        <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tighter">
          Workforce <span className="text-teal-500">Progress</span>
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
          Asset Progression Overview
        </p>
      </div>

      <div className="h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barSize={24} margin={{ right: 40, left: 10 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10, fontWeight: "bold" }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "900" }} width={100} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card rounded-2xl p-4 border border-white/10 backdrop-blur-2xl bg-black/60 shadow-2xl"
                    >
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        {item.name} History
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="text-2xl font-black italic tracking-tighter" style={{ color: item.color }}>
                          {item.value}<span className="text-[10px] not-italic text-slate-500 uppercase ml-2 font-bold tracking-widest">Total Assignments</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={2000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
```

---

## 8. Source Code: `components/admin-dashboard/incidents-chart.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, BarChart3, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_CONFIG = {
  activity: {
    label: "Activity",
    title: "Training Volume",
    subtitle: "Modules completed over time",
    icon: Activity,
    unit: " completed",
    colorStart: "#2dd4bf",
    colorEnd: "#fbbf24",
  },
  performance: {
    label: "Performance",
    title: "Retention Index",
    subtitle: "Knowledge base stability",
    icon: BarChart3,
    unit: " index",
    colorStart: "#818cf8",
    colorEnd: "#c084fc",
  },
  compliance: {
    label: "Compliance",
    title: "Safeguard Rating",
    subtitle: "Fleet compliance validation",
    icon: ShieldCheck,
    unit: "% compliance",
    colorStart: "#34d399",
    colorEnd: "#2dd4bf",
  },
};

type TabKey = keyof typeof CHART_CONFIG;

export function IncidentsChart({ data }: { data?: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>("activity");

  const fallbackData = {
    activity: [
      { name: "Jan", value: 40 }, { name: "Feb", value: 65 }, { name: "Mar", value: 90 }, { name: "Apr", value: 120 }
    ],
    performance: [
      { name: "Jan", value: 75 }, { name: "Feb", value: 82 }, { name: "Mar", value: 88 }, { name: "Apr", value: 95 }
    ],
    compliance: [
      { name: "Jan", value: 85 }, { name: "Feb", value: 89 }, { name: "Mar", value: 94 }, { name: "Apr", value: 98 }
    ],
  };

  const chartData = data ? data[activeTab] : fallbackData[activeTab];
  const config = CHART_CONFIG[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/90 glass-card rounded-[3rem] p-8 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 h-full flex flex-col relative overflow-hidden group backdrop-blur-3xl"
    >
      {/* Background Animated Orb */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-20 -right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-100 uppercase italic tracking-tighter">
            {config.title}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">{config.subtitle}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 relative shadow-inner">
          {(Object.keys(CHART_CONFIG) as TabKey[]).map((key) => {
            const tab = CHART_CONFIG[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "relative flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 z-10 italic",
                  isActive ? "text-slate-950" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeChartTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`fillGradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.colorStart} stopOpacity={0.3} />
                <stop offset="100%" stopColor={config.colorStart} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`strokeGradient-${activeTab}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={config.colorStart} />
                <stop offset="100%" stopColor={config.colorEnd} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 9, fontWeight: "900" }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 9, fontWeight: "900" }} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-[#0f172a]/95 glass-card rounded-2xl p-5 border border-white/10 shadow-2xl backdrop-blur-3xl"
                    >
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
                        {payload[0].payload.name} Data Analysis
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-black/20" style={{ borderColor: `${config.colorStart}40`, color: config.colorStart }}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{config.label}</p>
                          <p className="text-2xl font-black text-white italic tracking-tighter">
                            {payload[0].value}<span className="text-sm not-italic opacity-40 ml-1">{config.unit}</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />

            <Area
              key={activeTab}
              type="monotone"
              dataKey="value"
              stroke={`url(#strokeGradient-${activeTab})`}
              strokeWidth={4}
              fill={`url(#fillGradient-${activeTab})`}
              style={{ filter: "url(#glow)" }}
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
```

---

## 9. Source Code: `components/admin-dashboard/modules/module-stats.tsx`

```tsx
"use client"

import { motion } from "framer-motion"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"
import { Users, MapPin, Building2, TrendingUp } from "lucide-react"

const COLORS = ['#2dd4bf', '#818cf8', '#f472b6', '#fbbf24', '#34d399', '#60a5fa']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-3 border border-white/10 shadow-2xl backdrop-blur-md"
            >
                <p className="text-[10px] font-black text-slate-100 mb-1 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: payload[0].fill }} />
                    <p className="text-[14px] font-black text-amber-400 italic">
                        {payload[0].value} <span className="text-[10px] text-slate-500 uppercase font-black not-italic ml-1">Drivers</span>
                    </p>
                </div>
            </motion.div>
        );
    }
    return null;
};

const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;

    return (
        <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x={x + width + 10}
            y={y + 11}
            fill="#fbbf24"
            fontSize={10}
            fontWeight="900"
            textAnchor="start"
            className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] italic"
        >
            {value}
        </motion.text>
    );
};

export function ModuleStats({ analytics }: { analytics: any }) {
    if (!analytics) return null;

    return (
        <div className="space-y-8">
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <div className="p-7 bg-white/[0.03] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                <div className="h-[200px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.teams || []} layout="vertical" margin={{ left: -10, right: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={90} fontSize={10} tick={{ fill: '#94a3b8', fontWeight: '900' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14} filter="url(#glow)" animationDuration={1500}>
                                {(analytics.teams || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList dataKey="value" content={<CustomBarLabel />} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
```
