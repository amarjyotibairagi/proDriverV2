"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface TrainingChartProps {
  data: number[]; // Expecting [completed, ongoing, pending]
}

export function TrainingChart({ data = [0, 0, 0] }: TrainingChartProps) {
  // Transform the array into a format Recharts understands
  const chartData = [
    { name: "Completed", value: data[0], color: "#14b8a6" }, // Teal
    { name: "Ongoing", value: data[1], color: "#eab308" },   // Yellow
    { name: "Not Started", value: data[2], color: "#64748b" }, // Slate
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] h-full overflow-hidden relative"
    >
      {/* Background Accent */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

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
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 10, fontWeight: "bold" }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "900", letterSpacing: "1px" }}
              width={100}
            />
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
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              animationDuration={2000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Counter Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
        {chartData.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{stat.name}</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: stat.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}