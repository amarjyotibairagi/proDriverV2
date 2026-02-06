"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const data = [
  { category: "Speeding", value: 78 },
  { category: "Harsh Braking", value: 65 },
  { category: "Fatigue", value: 45 },
  { category: "Phone Use", value: 58 },
  { category: "Seatbelt", value: 25 },
];

export function RiskRadar() {
  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Risk Analysis</h3>
        <p className="text-sm text-slate-400">Driver behavior patterns</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <PolarGrid
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
            />
            <Radar
              name="Risk Score"
              dataKey="value"
              stroke="url(#radarGradient)"
              fill="url(#radarFill)"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 8px rgba(20, 184, 166, 0.5))",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
