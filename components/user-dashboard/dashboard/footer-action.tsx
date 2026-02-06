"use client"

import { AlertTriangle } from "lucide-react"
import { useEffect, useRef } from "react"

export function FooterAction() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    button.style.opacity = "0"
    button.style.transform = "translateY(20px)"
    
    setTimeout(() => {
      button.style.transition = "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      button.style.opacity = "1"
      button.style.transform = "translateY(0)"
    }, 600)
  }, [])

  return (
    <div className="flex justify-center py-3 sm:py-4">
      <button 
        ref={buttonRef}
        className="flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-b from-[#E8C84B] via-[#D4AF37] to-[#B8962F] hover:from-[#F0D45A] hover:via-[#E0BC42] hover:to-[#C4A035] text-black font-black text-base sm:text-lg uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{ boxShadow: '0 0 25px rgba(212, 175, 55, 0.4), 0 0 50px rgba(212, 175, 55, 0.2), 0 10px 30px rgba(0, 0, 0, 0.3)' }}
      >
        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        Safety Alert
      </button>
    </div>
  )
}
