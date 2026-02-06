"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  Phone,
  ShieldAlert,
  Siren,
  AlertTriangle,
  LogIn,
  FileCheck,
  UserCog,
  Activity,
  Award,
  Terminal
} from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  timestamp: Date;
  actor: {
    full_name: string;
    employee_id: string;
  };
}

interface RecentActivityProps {
  logs?: ActivityLog[];
}

const getActionStyle = (action: string) => {
  const normalized = action.toUpperCase();

  if (normalized.includes("LOGIN")) return {
    icon: LogIn,
    style: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    label: "Access Authorized"
  };
  if (normalized.includes("TEST_COMPLETED") || normalized.includes("PASSED")) return {
    icon: Award,
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Validation Pass"
  };
  if (normalized.includes("FAILED")) return {
    icon: AlertTriangle,
    style: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    label: "Training Failed"
  };
  if (normalized.includes("PROFILE")) return {
    icon: UserCog,
    style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    label: "Profile Updated"
  };
  if (normalized.includes("MODULE_ASSIGNED")) return {
    icon: FileCheck,
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Module Assigned"
  };

  return {
    icon: Activity,
    style: "bg-slate-500/10 text-slate-400 border-white/5",
    label: "General Activity"
  };
};

export function RecentActivity({ logs = [] }: RecentActivityProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/95 glass-card rounded-[3rem] p-8 border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] h-full backdrop-blur-3xl relative overflow-hidden"
    >
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
            <Terminal className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-widest">Activity <span className="text-teal-400">Feed</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Live Audit Feed</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 hover:text-teal-400 transition-all uppercase tracking-[0.2em] italic"
        >
          View Full History
        </motion.button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-4 relative z-10"
      >
        {logs.length === 0 ? (
          <div className="text-center py-16 text-slate-600 text-[10px] uppercase font-black tracking-[0.4em] italic border-2 border-dashed border-white/5 rounded-[2rem] bg-black/20">
            Scanning for Recent Activity...
          </div>
        ) : (
          logs.map((log) => {
            const { icon: Icon, style, label } = getActionStyle(log.action);

            const timeString = new Date(log.timestamp).toLocaleTimeString("en-US", {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <motion.div
                variants={item}
                key={log.id}
                whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.04)" }}
                className="flex items-center gap-5 p-4 rounded-2xl bg-black/40 border border-white/5 transition-all group overflow-hidden relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/50 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div
                  className={`p-3 rounded-2xl border ${style} transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-[14px] font-black text-slate-200 truncate italic uppercase tracking-tighter">
                      {log.actor?.full_name || "System"}
                    </p>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">ID:{log.actor?.employee_id || "SYS"}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate uppercase font-bold tracking-widest mt-1.5 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-slate-700" />
                    {label} // {log.action.replace(/_/g, " ").toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span suppressHydrationWarning className="text-[10px] text-teal-500/40 whitespace-nowrap font-black italic tracking-[0.2em]">
                    {timeString}
                  </span>
                  <div className="h-0.5 w-full bg-teal-500/10 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-full bg-teal-500/20"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}