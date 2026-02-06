"use client";

import { Users, ShieldCheck, AlertCircle, BookOpen, TrendingUp } from "lucide-react";

const kpiData = [
  {
    title: "Total Workforce",
    value: "1,240",
    trend: "+5%",
    trendUp: true,
    icon: Users,
    accentColor: "from-teal-500 to-teal-400",
    glowClass: "",
  },
  {
    title: "Compliance Rate",
    value: "94%",
    progress: 94,
    icon: ShieldCheck,
    accentColor: "from-teal-500 to-amber-500",
    glowClass: "",
  },
  {
    title: "Open Incidents",
    value: "3",
    subtitle: "Requires attention",
    icon: AlertCircle,
    accentColor: "from-red-500 to-red-400",
    glowClass: "glow-red",
  },
  {
    title: "Training Due",
    value: "12",
    subtitle: "This week",
    icon: BookOpen,
    accentColor: "from-amber-500 to-yellow-400",
    glowClass: "glow-yellow",
  },
];

function RadialProgress({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.5))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-100">{value}%</span>
      </div>
    </div>
  );
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi) => (
        <div
          key={kpi.title}
          className={`glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] overflow-hidden relative ${kpi.glowClass}`}
        >
          {kpi.progress !== undefined ? (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-400 mb-1">
                  {kpi.title}
                </p>
                <div className="flex items-center gap-4">
                  <RadialProgress value={kpi.progress} />
                </div>
              </div>
              <div
                className="shrink-0 p-3 rounded-xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(20, 184, 166, 0.2), transparent)`,
                }}
              >
                <kpi.icon className="w-6 h-6 shrink-0 text-teal-400" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <p className="text-sm font-medium text-slate-400 mb-1">
                {kpi.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-100">
                  {kpi.value}
                </span>
                {kpi.trend && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      kpi.trendUp ? "text-teal-400" : "text-red-400"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-0.5" />
                    {kpi.trend}
                  </span>
                )}
              </div>
              {kpi.subtitle && (
                <p className="text-xs text-slate-500 mt-1">{kpi.subtitle}</p>
              )}
              <div className="mt-auto pt-3">
                <div
                  className="inline-flex p-2.5 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${kpi.accentColor.includes("red") ? "rgba(239, 68, 68, 0.2)" : kpi.accentColor.includes("amber") ? "rgba(234, 179, 8, 0.2)" : "rgba(20, 184, 166, 0.2)"}, transparent)`,
                  }}
                >
                  <kpi.icon
                    className={`w-5 h-5 ${
                      kpi.accentColor.includes("red")
                        ? "text-red-400"
                        : kpi.accentColor.includes("amber")
                          ? "text-amber-400"
                          : "text-teal-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
