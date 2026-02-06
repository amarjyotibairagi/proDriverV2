"use client"

import Image from "next/image"
import { useState } from "react"
import { UserProfilePopup } from "./user-profile-popup"
import { LANGUAGES, translations } from "@/lib/languages"
import { Globe, ChevronDown } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { NotificationsDropdown } from "../admin-dashboard/notifications-dropdown"

export function Header({
  showProfile = true,
  user,
  currentLang = 'en'
}: {
  showProfile?: boolean
  user?: { name: string; id: string; dbId?: string } | null
  currentLang?: string
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use real data or fallback
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "O"
  const employeeId = user?.id || "USER001"

  const handleLangChange = (code: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', code)
    router.push(`${pathname}?${params.toString()}`)
    setIsLangOpen(false)
  }

  const selectedLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]
  const isRtl = selectedLang.dir === 'rtl'
  const t = translations[currentLang] || translations['en']

  return (
    <>
      <header
        className="w-full bg-black/40 backdrop-blur-md border-b border-[#D4AF37]/20 relative z-[100]"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          {/* Left - HSSE Text */}
          <div className="flex flex-col flex-shrink-0 gap-1">
            <span className="text-white font-black text-[10px] sm:text-xs tracking-[0.2em] leading-tight uppercase">{t.hsse || "HSSE"}</span>
            <span className="text-[#2BB5A8] font-black text-[10px] sm:text-xs tracking-[0.2em] leading-tight uppercase">{t.department || "DEPARTMENT"}</span>
          </div>

          {/* Right - Logo & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Logo - Moved to Right */}
            <Image
              src="/mowasalat-logo.png"
              alt="Mowasalat Logo"
              width={140}
              height={50}
              className="h-8 sm:h-10 w-auto object-contain"
              priority
            />

            {/* Notifications */}
            <NotificationsDropdown userId={user?.dbId || user?.id} role="BASIC" />

            {/* Language Selector Section */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <Globe className="w-4 h-4 text-[#2BB5A8]" />
                <span className="text-[10px] sm:text-xs font-bold uppercase text-white/90">{selectedLang.code}</span>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* User Profile Pill (if enabled) */}
            {showProfile && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/40 backdrop-blur-sm hover:border-[#D4AF37] hover:bg-black/70 transition-all duration-300 hover:scale-105"
                style={{ boxShadow: '0 0 15px rgba(212, 175, 55, 0.1), 0 0 30px rgba(212, 175, 55, 0.05)' }}
              >
                {/* Avatar */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2BB5A8] flex items-center justify-center text-black font-bold text-xs sm:text-sm">
                  {userInitial}
                </div>
                <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
                  {t.operator || "OPERATOR"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Language Selector Modal (Moved Outside Header for Z-Index Safety) */}
      <AnimatePresence>
        {isLangOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLangOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a1a18] border border-[#D4AF37]/40 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="py-4 text-center bg-[#D4AF37]/10 border-b border-[#D4AF37]/20">
                <span className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] italic">
                  {t.selectLanguage || "SELECT LANGUAGE"}
                </span>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 border ${currentLang === lang.code
                      ? "bg-[#2BB5A8]/20 border-[#2BB5A8] shadow-[0_0_20px_rgba(43,181,168,0.1)]"
                      : "bg-white/5 border-white/5 hover:border-[#D4AF37]/30 hover:bg-white/10"
                      }`}
                    dir={lang.dir}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentLang === lang.code ? "bg-[#2BB5A8] text-black" : "bg-slate-800 text-slate-400"
                        }`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className={`font-bold uppercase tracking-wider ${currentLang === lang.code ? "text-white" : "text-slate-400"
                        } ${lang.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {lang.name}
                      </span>
                    </div>
                    {currentLang === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-[#2BB5A8] shadow-[0_0_10px_#2BB5A8]"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => setIsLangOpen(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-500 font-black rounded-xl transition-all uppercase text-[10px] tracking-[0.4em] italic border border-white/5"
                >
                  {t.close || "CLOSE"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Popup */}
      <UserProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userInitial={userInitial}
        userName={user?.name || "Driver User"}
        userId={employeeId}
        lang={currentLang}
      />
    </>
  )
}
