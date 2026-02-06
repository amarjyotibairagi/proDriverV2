"use client"

import { X, User, Mail, Phone, Lock, Building, MapPin, ShieldCheck, Award as IdCard } from "lucide-react"
import { useEffect, useRef } from "react"

interface UserDetails {
    id: string
    full_name: string
    employee_id: string
    email: string | null
    mobile_number: string | null
    role: string
    department?: { id: string; name: string } | null
    company?: string | null
    assigned_location?: { id: string; name: string } | null
    home_location?: { id: string; name: string } | null
}

interface UserDetailsPopupProps {
    isOpen: boolean
    onClose: () => void
    user: UserDetails | null
}

export function UserDetailsPopup({ isOpen, onClose, user }: UserDetailsPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark Overlay with Blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Modal Content */}
            <div ref={popupRef} className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="w-full bg-[#0f172a] border border-teal-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-teal-500/20 bg-teal-950/20">
                        <h3 className="text-slate-100 font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-teal-400" />
                            User Profile
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-slate-800 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-teal-500/20 mb-3 border border-white/10">
                                {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-white text-center">{user.full_name}</h2>
                            <div className={`mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold border ${user.role === 'ADMIN'
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                }`}>
                                {user.role === 'ADMIN' ? 'ADMINISTRATOR' : 'DRIVER / BASIC'}
                            </div>
                        </div>

                        {/* Info Rows */}
                        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <InfoRow icon={IdCard} label="Employee ID" value={user.employee_id} />
                            <InfoRow icon={Building} label="Company" value={user.company || "N/A"} />
                            <InfoRow icon={Mail} label="Email Address" value={user.email || "N/A"} />
                            <InfoRow icon={Phone} label="Mobile Number" value={user.mobile_number || "N/A"} />
                            <InfoRow icon={Building} label="Designation / Team" value={user.department?.name || "General"} />
                            <InfoRow icon={MapPin} label="Home Depot" value={user.home_location?.name || "N/A"} />
                            <InfoRow icon={MapPin} label="Assigned Site" value={user.assigned_location?.name || "Unassigned"} iconColor="text-emerald-400" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value, iconColor = "text-teal-400" }: { icon: any, label: string, value: string, iconColor?: string }) {
    return (
        <div className="flex items-center gap-3 p-2">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">{label}</p>
                <p className="text-slate-200 text-sm font-medium truncate" title={value}>{value}</p>
            </div>
        </div>
    )
}
