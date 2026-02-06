"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Activity, GraduationCap, ShieldCheck, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TrendData {
  activity: ChartDataPoint[];
  performance: ChartDataPoint[];
  compliance: ChartDataPoint[];
}

interface IncidentsChartProps {
  data?: TrendData;
}

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

export function IncidentsChart({ data }: IncidentsChartProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("activity");

  if (!data) {
    return (
      <div className="bg-[#0f172a]/95 glass-card rounded-[3rem] p-8 h-[450px] flex items-center justify-center border border-white/10 shadow-2xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-teal-500 animate-spin" />
          <span className="font-black uppercase tracking-[0.4em] text-[11px] text-slate-500 italic">Gathering Analytical Data...</span>
        </motion.div>
      </div>
    );
  }

  const config = CHART_CONFIG[activeTab];
  const currentData = data[activeTab] || [];

  const currentVal = currentData[currentData.length - 1]?.value || 0;
  const prevVal = currentData[currentData.length - 2]?.value || 0;
  const isUp = currentVal >= prevVal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/90 glass-card rounded-[3rem] p-8 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 h-full flex flex-col relative overflow-hidden group backdrop-blur-3xl"
    >
      {/* Background Animated Orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-20 -right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-100 flex items-center gap-3 uppercase italic tracking-tighter">
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

      {/* Dynamic Trend Badge */}
      <div className="flex items-center gap-5 mb-8 relative z-10">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-[11px] font-black italic uppercase tracking-widest ${isUp
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
        >
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4 rotate-180" />}
          <span>
            {currentVal}{activeTab !== 'activity' && '%'} Trend
          </span>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Consolidated Analytics // Verified</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 9, fontWeight: "900", letterSpacing: "1px" }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 9, fontWeight: "900" }}
            />

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
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-black/20"
                          style={{ borderColor: `${config.colorStart}40`, color: config.colorStart }}
                        >
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