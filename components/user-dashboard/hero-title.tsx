"use client"

import { motion } from "framer-motion"

export function HeroTitle() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative group"
      >
        {/* Animated Glow Backing */}
        <div className="absolute -inset-4 bg-teal-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Main Title Card */}
        <div
          className="px-8 py-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative z-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic">
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PRO</span>
            <span className="text-[#2BB5A8] [text-shadow:0_0_20px_rgba(43,181,168,0.4)]">DRIVER</span>
          </h1>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-sm opacity-50" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37] rounded-br-sm opacity-50" />
      </motion.div>

      {/* Portal Designation Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-5 py-1.5 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 backdrop-blur-md shadow-lg"
      >
        <span className="text-[#D4AF37] text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase italic">
          HSSE Training Module
        </span>
      </motion.div>

      {/* Status Line */}
      <div className="flex items-center gap-3 mt-1">
        <div className="w-[40px] h-px bg-gradient-to-r from-transparent to-teal-500/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50 animate-pulse" />
        <div className="w-[40px] h-px bg-gradient-to-l from-transparent to-teal-500/30" />
      </div>
    </div>
  )
}
