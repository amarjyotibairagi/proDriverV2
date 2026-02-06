"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Lock, MapPin, Building, Award as IdCard, Pencil, KeyRound, LogOut, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateProfile, changePassword, getUser } from "@/app/actions/user"
import { translations, LANGUAGES } from "@/lib/languages"

interface UserProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  userInitial?: string
  userName?: string
  userId?: string
  lang?: string
}

type View = "profile" | "edit-profile" | "change-password"

export function UserProfilePopup({
  isOpen,
  onClose,
  userInitial = "U",
  userName = "Driver User",
  userId = "USER001",
  lang = "en"
}: UserProfilePopupProps) {
  const router = useRouter()
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]
  const isRtl = currentLang.dir === 'rtl'
  const t = translations[lang] || translations["en"]
  const [view, setView] = useState<View>("profile")
  const popupRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState({
    employeeId: userId,
    name: userName,
    company: "Loading...",
    location: "Loading...",
    assignedArea: "Loading...",
    mobile: ""
  })

  // Edit profile form state
  const [editForm, setEditForm] = useState(profileData)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch Fresh Data on Open
  useEffect(() => {
    async function fetchUserData() {
      if (isOpen && userId) {
        setFetching(true)
        const result = await getUser(userId)

        if (result.success && result.user) {
          const newData = {
            name: result.user.name,
            mobile: result.user.mobile,
            company: result.user.company,
            location: result.user.location,
            assignedArea: result.user.assignedArea,
            employeeId: userId
          }
          setProfileData(prev => ({ ...prev, ...newData }))
          setEditForm(prev => ({ ...prev, ...newData }))
        }
        setFetching(false)
      }
    }

    fetchUserData()
  }, [isOpen, userId])

  // Reset forms when switching views
  useEffect(() => {
    if (view === "edit-profile") setEditForm(profileData)
    if (view === "change-password") setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
  }, [view, profileData])

  // Click Outside Hook
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const handleEditSubmit = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(profileData.employeeId, {
        name: editForm.name,
        mobile: editForm.mobile,
        location: editForm.location
      })

      if (result.success) {
        setProfileData(editForm)
        setView("profile")
      } else {
        alert("Failed to update profile: " + result.error)
      }
    } catch (error) {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.oldPassword) return

    setLoading(true)
    try {
      const result = await changePassword(
        profileData.employeeId,
        passwordForm.oldPassword,
        passwordForm.newPassword
      )

      if (result.success) {
        alert("Password changed successfully!")
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
        setView("profile")
      } else {
        alert(result.error || "Failed to change password")
      }
    } catch (error) {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    router.push(`/login?lang=${lang}`)
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[100] flex items-center sm:items-start ${isRtl ? 'justify-center sm:justify-start' : 'justify-center sm:justify-end'} pt-0 sm:pt-14 px-4 sm:px-0 ${isRtl ? 'sm:pl-6' : 'sm:pr-6'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Added max-h and overflow-y-auto to ensure it fits small screens */}
      <div ref={popupRef} className={`relative z-10 w-full sm:w-auto max-w-[340px] sm:max-w-none animate-in ${isRtl ? 'slide-in-from-left-5' : 'slide-in-from-right-5'} fade-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl`}>
        <div className="w-full sm:w-[360px] bg-gray-900/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[#D4AF37]/20">
            <h3 className="text-white font-bold text-sm sm:text-base">
              {view === "profile" && (t.profile || "User Profile")}
              {view === "edit-profile" && (t.edit || "Edit Profile")}
              {view === "change-password" && (t.changePassLink || "Change Password")}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {fetching ? (
            <div className="p-8 flex justify-center items-center text-[#D4AF37]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
            </div>
          ) : (
            <>
              {/* VIEW: PROFILE */}
              {view === "profile" && (
                // Reduced padding from p-4 to p-3, space-y-3 to space-y-2.5
                <div className="p-3 space-y-2.5">
                  {/* Compact Avatar Section */}
                  <div className="flex justify-center -mt-1 mb-1">
                    <div className="w-14 h-14 rounded-full bg-[#2BB5A8] flex items-center justify-center text-black font-black text-xl ring-2 ring-[#D4AF37]/40">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : userInitial}
                    </div>
                  </div>

                  {/* Compact Info Rows */}
                  <div className="space-y-2">
                    <InfoRow icon={IdCard} label={t.lblId || "Employee ID"} value={profileData.employeeId} />
                    <InfoRow icon={User} label={t.empName || "Name"} value={profileData.name} />
                    <InfoRow icon={Building} label={t.phCompany || "Company"} value={profileData.company} />
                    <InfoRow icon={Phone} label={t.mobile || "Mobile"} value={profileData.mobile} />
                    <InfoRow icon={MapPin} label={t.phDepot || "Location"} value={profileData.location} />
                    <InfoRow icon={Building} label={t.phDesignation || "Designation"} value={profileData.assignedArea} />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex gap-2 pt-1">
                    <ActionButton onClick={() => setView("edit-profile")} icon={Pencil} label={t.edit || "Edit"} primary />
                    <ActionButton onClick={() => setView("change-password")} icon={KeyRound} label={t.pass || "Password"} />
                  </div>

                  {/* Compact Logout */}
                  <div className="pt-2 mt-1 border-t border-[#D4AF37]/10">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 font-bold py-2 rounded-xl transition-all duration-200 group text-xs sm:text-sm">
                      <LogOut size={14} className={`transition-transform ${isRtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                      {t.signOut || "Sign Out"}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: EDIT PROFILE */}
              {view === "edit-profile" && (
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <InputGroup label={t.lblId || "Employee ID"} value={editForm.employeeId} icon={IdCard} readOnly />
                    <InputGroup label={t.empName || "Name"} value={editForm.name} icon={User} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })} required />
                    <InputGroup label={t.phCompany || "Company"} value={editForm.company} icon={Building} readOnly />
                    <InputGroup label={t.mobile || "Mobile"} value={editForm.mobile} icon={Phone} onChange={(e: any) => setEditForm({ ...editForm, mobile: e.target.value })} />
                    <InputGroup label={t.phDepot || "Location"} value={editForm.location} icon={MapPin} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} />
                    <InputGroup label={t.phDesignation || "Designation"} value={editForm.assignedArea} icon={Building} onChange={(e: any) => setEditForm({ ...editForm, assignedArea: e.target.value })} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <ActionButton onClick={() => setView("profile")} label={t.cancel || "Cancel"} />
                    <ActionButton onClick={handleEditSubmit} label={loading ? (t.saving || "Saving...") : (t.update || "Update")} primary disabled={loading} />
                  </div>
                </div>
              )}

              {/* VIEW: CHANGE PASSWORD */}
              {view === "change-password" && (
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <InputGroup label={t.oldPass || "Old Password"} type="password" value={passwordForm.oldPassword} icon={Lock} onChange={(e: any) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} placeholder={t.oldPass} />
                    <InputGroup label={t.newPass || "New Password"} type="password" value={passwordForm.newPassword} icon={Lock} onChange={(e: any) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder={t.newPass} />
                    <InputGroup label={t.rePass || "Confirm Password"} type="password" value={passwordForm.confirmPassword} icon={Lock} onChange={(e: any) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder={t.rePass} />

                    {passwordForm.newPassword && passwordForm.confirmPassword &&
                      passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-red-400 text-[10px] ml-1">{t.passMismatch || "Passwords do not match"}</p>
                      )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <ActionButton onClick={() => setView("profile")} label={t.cancel || "Cancel"} />
                    <ActionButton onClick={handlePasswordSubmit} label={loading ? (t.updating || "Updating...") : (t.update || "Update")} primary disabled={loading} />
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

// --- HELPER COMPONENTS (Now More Compact) ---

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    // Reduced padding from p-2.5 to p-2
    <div className="flex items-center gap-2.5 p-2 bg-black/30 rounded-lg border border-[#D4AF37]/10">
      <Icon className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
      <div className="min-w-0 flex-1 flex justify-between items-baseline gap-2">
        <p className="text-[#D4AF37]/70 text-[10px] uppercase tracking-wide shrink-0">{label}</p>
        <p className={`text-white font-medium text-xs sm:text-sm truncate`}>{value}</p>
      </div>
    </div>
  )
}

function InputGroup({ label, icon: Icon, value, onChange, type = "text", placeholder, readOnly, required }: any) {
  return (
    <div>
      <label className="block text-[#D4AF37]/70 text-[9px] uppercase tracking-wide mb-0.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {/* Reduced vertical padding from py-2.5 to py-2 */}
      <div className={`flex items-center gap-2 px-3 py-2 ${readOnly ? 'bg-black/20 border-[#D4AF37]/10' : 'bg-black/30 border-[#D4AF37]/30 focus-within:border-[#D4AF37]'} rounded-lg border`}>
        <Icon className={`w-3.5 h-3.5 ${readOnly ? 'text-white/30' : 'text-[#D4AF37]'}`} />
        {readOnly ? (
          <span className="text-white/50 text-xs sm:text-sm">{value}</span>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-white/30"
          />
        )}
      </div>
    </div>
  )
}

function ActionButton({ onClick, label, icon: Icon, primary, disabled }: any) {
  return (
    // Reduced padding slightly
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wide transition-all duration-300 ${primary ? "bg-[#2BB5A8] text-black hover:bg-[#249e93]" : "bg-black/50 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37]"} disabled:opacity-50`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  )
}