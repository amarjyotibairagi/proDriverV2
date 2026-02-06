"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Building, Users, Globe, Terminal, Activity, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsDropdown } from "./notifications-dropdown";

export function Header({ showFilter = false }: { showFilter?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("company") as 'MOWASALAT' | 'CONTRACTORS' | 'ALL' || 'MOWASALAT';

  const [activeFilter, setActiveFilter] = useState(currentFilter);

  useEffect(() => {
    setActiveFilter(currentFilter);
  }, [currentFilter]);

  const handleFilterChange = (filter: 'MOWASALAT' | 'CONTRACTORS' | 'ALL') => {
    setActiveFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    params.set("company", filter);
    router.push(`?${params.toString()}`);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 mb-10 relative"
    >

      {/* Top Row: Title & Actions (The Hero Area) */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pt-4">

        {/* Title Section (Hero) */}
        <motion.div variants={item} className="pl-14 lg:pl-0 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5">
              <Terminal className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Administrative <span className="text-teal-400">Overview</span></span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
            Command <span className="text-teal-500 [text-shadow:0_0_30px_rgba(20,184,166,0.4)]">Center</span>
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Status: Online</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Real-time Fleet Performance Data
            </p>
          </div>
        </motion.div>

        {/* Right Side Actions */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-4">
          {/* Date Display */}
          <div className="glass-card rounded-2xl px-6 py-3.5 flex items-center gap-3 border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl shadow-2xl">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest italic">{today}</span>
          </div>



          {/* Notification Bell */}
          <NotificationsDropdown role="ADMIN" />

          {/* Logo Container */}
          <div className="h-12 w-auto bg-black/60 rounded-2xl px-6 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <img
              src="/mowasalat-logo.png"
              alt="Company Logo"
              className="h-6 w-auto object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Data Switch Bar */}
      {showFilter && (
        <motion.div
          variants={item}
          className="flex p-1.5 bg-[#0f172a]/90 border border-white/10 rounded-[2rem] w-fit relative overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <AnimatePresence mode="popLayout">
            <FilterTab
              key="MOWASALAT"
              label="Internal (Mowasalat)"
              active={activeFilter === 'MOWASALAT'}
              onClick={() => handleFilterChange('MOWASALAT')}
              icon={Building}
              activeColor="teal"
            />
            <FilterTab
              key="CONTRACTORS"
              label="Contractors"
              active={activeFilter === 'CONTRACTORS'}
              onClick={() => handleFilterChange('CONTRACTORS')}
              icon={Users}
              activeColor="amber"
            />
            <FilterTab
              key="ALL"
              label="Unified View"
              active={activeFilter === 'ALL'}
              onClick={() => handleFilterChange('ALL')}
              icon={Globe}
              activeColor="indigo"
            />
          </AnimatePresence>
        </motion.div>
      )}

      {/* Hero Ambient Light Section */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

    </motion.header>
  );
}

function FilterTab({ label, active, onClick, icon: Icon, activeColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative px-8 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-3 uppercase italic tracking-widest z-10 ${active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
    >
      {active && (
        <motion.div
          layoutId="headerFilterTab"
          className={`absolute inset-0 rounded-2xl shadow-xl ${activeColor === 'indigo' ? 'bg-indigo-500 shadow-indigo-500/20' :
            activeColor === 'amber' ? 'bg-amber-500 shadow-amber-500/20' :
              'bg-teal-500 shadow-teal-500/20'
            }`}
          transition={{ type: "spring" as const, bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon className={`w-4 h-4 relative z-10 ${active ? "text-slate-900" : "text-slate-500"}`} />
      <span className="relative z-10">{label}</span>
    </button>
  )
}