"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", incidents: 12 },
  { month: "Feb", incidents: 8 },
  { month: "Mar", incidents: 15 },
  { month: "Apr", incidents: 10 },
  { month: "May", incidents: 7 },
  { month: "Jun", incidents: 5 },
  { month: "Jul", incidents: 9 },
  { month: "Aug", incidents: 6 },
  { month: "Sep", incidents: 4 },
  { month: "Oct", incidents: 8 },
  { month: "Nov", incidents: 3 },
  { month: "Dec", incidents: 5 },
];

export function IncidentsChart() {
  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Safety Incidents Overview
          </h3>
          <p className="text-sm text-slate-400">Monthly incident tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-amber-400" />
          <span className="text-xs text-slate-400">Incidents</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#eab308" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-card rounded-lg p-3 border border-white/10">
                      <p className="text-sm font-medium text-slate-100">
                        {payload[0].payload.month}
                      </p>
                      <p className="text-lg font-bold text-teal-400">
                        {payload[0].value} incidents
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="url(#strokeGradient)"
              strokeWidth={3}
              fill="url(#incidentGradient)"
              style={{ filter: "url(#glow)" }}
            />
            <defs>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
