"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Lock, MapPin, Building, Award as IdCard, Pencil, KeyRound } from "lucide-react"

interface UserProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  userInitial: string
}

type View = "profile" | "edit-profile" | "change-password"

export function UserProfilePopup({ isOpen, onClose, userInitial }: UserProfilePopupProps) {
  const [view, setView] = useState<View>("profile")
  const popupRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Profile data state
  const [profileData, setProfileData] = useState({
    employeeId: "EMP-2024-001",
    name: "Omar Hassan",
    location: "Doha, Qatar",
    assignedArea: "Industrial Zone A",
  })

  // Edit profile form state
  const [editForm, setEditForm] = useState(profileData)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Reset view when popup opens
  useEffect(() => {
    if (isOpen) {
      setView("profile")
      setEditForm(profileData)
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
    }
  }, [isOpen, profileData])

  // Animation on open
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.opacity = "0"
      contentRef.current.style.transform = "scale(0.95) translateY(-10px)"
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          contentRef.current.style.opacity = "1"
          contentRef.current.style.transform = "scale(1) translateY(0)"
        }
      }, 50)
    }
  }, [isOpen, view])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleEditSubmit = () => {
    setProfileData(editForm)
    setView("profile")
  }

  const handlePasswordSubmit = () => {
    // Password validation would go here
    if (passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.oldPassword) {
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setView("profile")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center sm:justify-end pt-0 sm:pt-14 px-4 sm:px-0 sm:pr-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Popup Content */}
      <div
        ref={popupRef}
        className="relative z-10 w-full sm:w-auto max-w-[340px] sm:max-w-none"
      >
        <div
          ref={contentRef}
          className="w-full sm:w-[360px] bg-gray-900/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#D4AF37]/20">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {view === "profile" && "User Profile"}
              {view === "edit-profile" && "Edit Profile"}
              {view === "change-password" && "Change Password"}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-[#D4AF37]/30"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
          </div>

          {/* Profile View */}
          {view === "profile" && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* User Avatar */}
              <div className="flex justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2BB5A8] flex items-center justify-center text-black font-black text-2xl sm:text-3xl ring-2 ring-[#D4AF37]/40">
                  {userInitial}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-black/30 rounded-xl border border-[#D4AF37]/10">
                  <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide">Employee ID</p>
                    <p className="text-white font-medium text-sm sm:text-base truncate">{profileData.employeeId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-black/30 rounded-xl border border-[#D4AF37]/10">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide">Name</p>
                    <p className="text-white font-medium text-sm sm:text-base truncate">{profileData.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-black/30 rounded-xl border border-[#D4AF37]/10">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide">Location</p>
                    <p className="text-white font-medium text-sm sm:text-base truncate">{profileData.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-black/30 rounded-xl border border-[#D4AF37]/10">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide">Assigned Area</p>
                    <p className="text-white font-medium text-sm sm:text-base truncate">{profileData.assignedArea}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => setView("edit-profile")}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#2BB5A8] hover:bg-[#249e93] text-black font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setView("change-password")}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/50 border border-[#D4AF37]/50 hover:border-[#D4AF37] text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                >
                  <KeyRound className="w-3 h-3 sm:w-4 sm:h-4" />
                  Password
                </button>
              </div>
            </div>
          )}

          {/* Edit Profile View */}
          {view === "edit-profile" && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Employee ID
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/20 rounded-xl border border-[#D4AF37]/10">
                    <IdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/30" />
                    <span className="text-white/50 text-sm sm:text-base">{editForm.employeeId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Name
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Location
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Assigned Area
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="text"
                      value={editForm.assignedArea}
                      onChange={(e) => setEditForm({ ...editForm, assignedArea: e.target.value })}
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => setView("profile")}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/50 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#2BB5A8] hover:bg-[#249e93] text-black font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Change Password View */}
          {view === "change-password" && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Old Password
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="Enter old password"
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    New Password
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37]/70 text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-1.5 ml-1">
                    Re-enter New Password
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 rounded-xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37]">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="flex-1 bg-transparent text-white text-sm sm:text-base outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                {passwordForm.newPassword && passwordForm.confirmPassword && 
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-red-400 text-[10px] sm:text-xs ml-1">Passwords do not match</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => setView("profile")}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/50 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!passwordForm.oldPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#2BB5A8] hover:bg-[#249e93] text-black font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
