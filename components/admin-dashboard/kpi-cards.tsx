"use client"

import { motion } from "framer-motion";
import { Users, ShieldCheck, AlertCircle, BookOpen, TrendingUp, Zap, Activity, Target } from "lucide-react";

interface KPIStats {
  totalUsers: number;
  userGrowth: number;
  totalModules: number;
  activeModules: number;
  totalAssignments: number;
  pendingTests: number;
  completionRate: number;
  averageScore: number;
  passedTests: number;
  failedTests: number;
}

interface KPIProps {
  stats: KPIStats;
}

function HighFiRadialProgress({ value, color }: { value: number, color: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <defs>
          <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
          cx="50"
          cy="50"
          r="40"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#cardGlow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white italic leading-none">{value}%</span>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Status</span>
      </div>
    </div>
  );
}

export function KPICards({ stats }: KPIProps) {

  const kpiData = [
    {
      title: "Active Workforce",
      value: stats?.totalUsers?.toString() || "0",
      trend: stats?.userGrowth === 100 ? "New Growth" : `${stats?.userGrowth}% Growth`,
      trendUp: (stats?.userGrowth ?? 0) >= 0,
      icon: Users,
      color: "#2dd4bf",
      desc: "Registered Drivers",
      tag: "Personnel"
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      progress: stats?.completionRate || 0,
      icon: Target,
      color: "#818cf8",
      desc: "Overall completion progress",
      tag: "Metrics"
    },
    {
      title: "Pending Assessments",
      value: stats?.pendingTests?.toString() || "0",
      icon: Activity,
      trend: "High Priority",
      trendUp: false,
      color: "#f43f5e",
      desc: "Tests awaiting resolution",
      tag: "Alert"
    },
    {
      title: "Active Assignments",
      value: stats?.totalAssignments?.toString() || "0",
      icon: Zap,
      trend: "Stable",
      trendUp: true,
      color: "#fbbf24",
      desc: "Current training modules",
      tag: "Assignments"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, bounce: 0.4, duration: 1 }
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {kpiData.map((kpi, idx) => (
        <motion.div
          variants={item}
          key={kpi.title}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative group cursor-default"
        >
          {/* Enhanced Background with higher opacity and more defined border */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] border border-white/10 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]" />
          <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2.5rem] -z-10" />

          {/* Localized Glow - Adjusted opacity for better visibility control */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-5 transition-opacity duration-700 group-hover:opacity-15"
            style={{ backgroundColor: kpi.color }}
          />

          <div className="relative p-7 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{kpi.tag}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                </div>
                <h3 className="text-[11px] font-black text-slate-200 uppercase tracking-widest leading-none">{kpi.title}</h3>
              </div>
              <div
                className="p-3 rounded-2xl bg-black/60 border border-white/10 shadow-inner transition-transform duration-500 group-hover:rotate-12"
                style={{ color: kpi.color }}
              >
                <kpi.icon className="w-5 h-5 shadow-2xl" />
              </div>
            </div>

            {kpi.progress !== undefined ? (
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white italic tracking-tighter mb-1">{kpi.value}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{kpi.desc}</p>
                </div>
                <HighFiRadialProgress value={kpi.progress} color={kpi.color} />
              </div>
            ) : (
              <div className="flex flex-col mt-auto">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-5xl font-black text-white italic tracking-tighter">{kpi.value}</span>
                  {kpi.trend && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-white/10 ${kpi.trendUp ? 'text-teal-400' : 'text-rose-500'}`}>
                      <TrendingUp className={`w-3 h-3 ${!kpi.trendUp && 'rotate-180'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{kpi.trend}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{kpi.desc}</p>

                {/* Tech Deco Line */}
                <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "300%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-current to-transparent opacity-40"
                    style={{ color: kpi.color }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}