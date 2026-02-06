"use client"

import { Suspense } from "react"
import { Header } from "@/components/user-dashboard/header"
import { HeroTitle } from "@/components/user-dashboard/hero-title"
import { LanguageSelector } from "@/components/user-dashboard/language-selector"
import { UserDynamicBackground } from "@/components/user-dashboard/dynamic-bg"
import { motion } from "framer-motion"
import { translations } from "@/lib/languages"

export default function LanguageSelectionPage() {
  const t = translations['en'] // Default for the gateway page
  return (
    <div className="min-h-screen selection:bg-teal-500/30 selection:text-teal-200 text-white overflow-hidden flex flex-col relative">
      <UserDynamicBackground />

      {/* Header - Edge to Edge */}
      <div className="relative z-20">
        <Suspense fallback={<div className="h-16" />}>
          <Header showProfile={false} currentLang="en" />
        </Suspense>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 mb-8 sm:mb-12 relative z-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Hero Title Section */}
          <HeroTitle />

          {/* Language Selection Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-1 flex flex-col overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative group"
          >
            {/* High-Fi Card Header */}
            <div className="py-4 text-center bg-gradient-to-r from-teal-500/10 via-teal-500/20 to-teal-500/10 rounded-t-[2.2rem] border-b border-teal-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="text-white font-black text-xs uppercase tracking-[0.5em] italic drop-shadow-lg relative z-10">
                {t.selectLanguage || "SELECT LANGUAGE"}
              </span>
            </div>

            {/* Scanning Line Effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-teal-500/40 blur-sm animate-[scan_4s_linear_infinite] pointer-events-none opacity-20" />

            {/* Card Content */}
            <div className="p-6 relative z-10">
              <Suspense fallback={<div className="h-40" />}>
                <LanguageSelector />
              </Suspense>
            </div>

            {/* Corner Tech Decor */}
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20" />
          </motion.div>

          {/* Footer Metadata */}
          <div className="text-center opacity-30 mt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
              {t.languageSelection || "Language Selection"}
            </span>
          </div>
        </div>
      </main>

    </div>
  )
}
