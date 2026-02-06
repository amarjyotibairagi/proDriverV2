"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { UserProfilePopup } from "./user-profile-popup"

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLButtonElement>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const userInitial = "O"

  useEffect(() => {
    const header = headerRef.current
    const logo = logoRef.current
    const profile = profileRef.current

    if (header) {
      header.style.opacity = "0"
      header.style.transform = "translateY(-20px)"
      setTimeout(() => {
        header.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        header.style.opacity = "1"
        header.style.transform = "translateY(0)"
      }, 100)
    }

    if (logo) {
      logo.style.opacity = "0"
      logo.style.transform = "scale(0.8)"
      setTimeout(() => {
        logo.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        logo.style.opacity = "1"
        logo.style.transform = "scale(1)"
      }, 400)
    }

    if (profile) {
      profile.style.opacity = "0"
      profile.style.transform = "translateX(20px)"
      setTimeout(() => {
        profile.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        profile.style.opacity = "1"
        profile.style.transform = "translateX(0)"
      }, 300)
    }
  }, [])

  return (
    <>
      <header 
        ref={headerRef}
        className="w-full bg-black/40 backdrop-blur-md border-b border-[#D4AF37]/20"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          {/* Left - Company Logo */}
          <div ref={logoRef} className="flex items-center gap-3 flex-shrink-0">
            <Image 
              src="/mowasalat-logo.png" 
              alt="Mowasalat Logo" 
              width={140} 
              height={50}
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>

          {/* Right - User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* User Profile Pill */}
            <button 
              ref={profileRef}
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/40 backdrop-blur-sm hover:border-[#D4AF37] hover:bg-black/70 transition-all duration-300 hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(212, 175, 55, 0.1), 0 0 30px rgba(212, 175, 55, 0.05)' }}
            >
              {/* Avatar */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2BB5A8] flex items-center justify-center text-black font-bold text-xs sm:text-sm">
                {userInitial}
              </div>
              <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">OPERATOR</span>
            </button>
          </div>
        </div>
      </header>

      {/* User Profile Popup */}
      <UserProfilePopup 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        userInitial={userInitial}
      />
    </>
  )
}
