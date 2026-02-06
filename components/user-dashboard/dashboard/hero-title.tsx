"use client"

import { useEffect, useRef } from "react"
import { translations } from "@/lib/languages"

interface HeroTitleProps {
  lang?: string
}

export function HeroTitle({ lang = 'en' }: HeroTitleProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  const t = translations[lang] || translations.en

  useEffect(() => {
    const title = titleRef.current
    const subtitle = subtitleRef.current

    if (title) {
      title.style.opacity = "0"
      title.style.transform = "translateY(20px) scale(0.95)"
      setTimeout(() => {
        title.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        title.style.opacity = "1"
        title.style.transform = "translateY(0) scale(1)"
      }, 150)
    }

    if (subtitle) {
      subtitle.style.opacity = "0"
      subtitle.style.transform = "translateY(10px)"
      setTimeout(() => {
        subtitle.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        subtitle.style.opacity = "1"
        subtitle.style.transform = "translateY(0)"
      }, 400)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-4">
      {/* HSSE Badge */}
      <div
        ref={subtitleRef}
        className="px-3 sm:px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30"
      >
        <span className="text-[#D4AF37] text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
          HSSE Training Module
        </span>
      </div>

      {/* Glass Title Container */}
      <div
        ref={titleRef}
        className="px-5 sm:px-8 py-2 sm:py-3 rounded-xl bg-black/40 backdrop-blur-md border border-[#D4AF37]/40 hover:border-[#D4AF37]/60 transition-all duration-300"
        style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.15), 0 0 40px rgba(212, 175, 55, 0.05)' }}
      >
        <h2 className="text-2xl sm:text-4xl font-black tracking-wide">
          <span className="text-white">PRO</span>
          <span className="text-[#2BB5A8]">DRIVER</span>
        </h2>
      </div>

      {/* Welcome Text */}
      <p className="text-white/60 text-xs sm:text-sm font-medium tracking-wider">
        {t.welcomeDashboard || 'Welcome to your Training Dashboard'}
      </p>
    </div>
  )
}
