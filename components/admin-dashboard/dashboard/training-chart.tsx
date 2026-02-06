"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { module: "Defensive Driving", completed: 85 },
  { module: "Hazard Awareness", completed: 72 },
  { module: "Fatigue Management", completed: 68 },
  { module: "Load Safety", completed: 90 },
  { module: "Emergency Response", completed: 55 },
];

export function TrainingChart() {
  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100">
          Training Module Completion
        </h3>
        <p className="text-sm text-slate-400">Workforce training progress</p>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={20}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <XAxis
              type="number"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="module"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-card rounded-lg p-3 border border-white/10">
                      <p className="text-sm font-medium text-slate-100">
                        {payload[0].payload.module}
                      </p>
                      <p className="text-lg font-bold text-teal-400">
                        {payload[0].value}% completed
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="completed"
              fill="url(#barGradient)"
              radius={[0, 8, 8, 0]}
              style={{
                filter: "drop-shadow(0 0 4px rgba(20, 184, 166, 0.4))",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
