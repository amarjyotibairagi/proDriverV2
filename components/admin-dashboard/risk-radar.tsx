"use client";

import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface RiskData {
  subject: string;
  value: number;
  fullMark: number;
}

export function RiskRadar({ data }: { data?: RiskData[] }) {
  const chartData = data || [
    { subject: "Knowledge Gap", value: 0, fullMark: 100 },
    { subject: "Compliance", value: 0, fullMark: 100 },
    { subject: "Test Failures", value: 0, fullMark: 100 },
    { subject: "Backlog", value: 0, fullMark: 100 },
    { subject: "Recency", value: 0, fullMark: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/95 glass-card rounded-[3rem] p-8 h-full flex flex-col relative overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl transition-all duration-500"
    >

      {/* Background Pulse (Subtle Red Glow) */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.03, 0.08, 0.03]
        }}
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

      {/* Chart */}
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

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-6 relative z-10">
        <span className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-400 italic">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
          />
          High Risk Area
        </span>
        <span className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-600 italic">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-700" />
          Operational Safety
        </span>
      </div>
    </motion.div >
  );
}