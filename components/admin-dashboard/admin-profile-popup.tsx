"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Lock, MapPin, Building, Pencil, KeyRound, LogOut, Phone, ShieldCheck, Terminal, UserSquare2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateProfile, changePassword, getUser } from "@/app/actions/user"
import { impersonateShadowAccount } from "@/app/actions/auth"
import { getShadowAccounts, createShadowAccount } from "@/app/actions/user-management"
import { motion, AnimatePresence } from "framer-motion"

interface AdminProfilePopupProps {
    isOpen: boolean
    onClose: () => void
    userId?: string
}

type View = "profile" | "edit-profile" | "change-password" | "shadow-accounts"

export function AdminProfilePopup({
    isOpen,
    onClose,
    userId = "ADMIN001"
}: AdminProfilePopupProps) {
    const router = useRouter()
    const [view, setView] = useState<View>("profile")
    const popupRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [shadows, setShadows] = useState<any[]>([])
    const [fetchingShadows, setFetchingShadows] = useState(false)

    const [profileData, setProfileData] = useState({
        employeeId: userId,
        name: "Admin User",
        location: "Headquarters",
        department: "Operations",
        mobile: "+974 0000 0000"
    })

    const [editForm, setEditForm] = useState(profileData)

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        async function fetchUserData() {
            if (isOpen && userId) {
                setFetching(true)
                try {
                    const result = await getUser(userId)

                    if (result.success && result.user) {
                        const newData = {
                            name: result.user.name,
                            mobile: result.user.mobile,
                            location: result.user.location,
                            department: result.user.assignedArea || "Operations",
                            employeeId: userId
                        }
                        setProfileData(prev => ({ ...prev, ...newData }))
                        setEditForm(prev => ({ ...prev, ...newData }))
                    }
                } catch (e) {
                    console.error("Failed to fetch admin data", e)
                } finally {
                    setFetching(false)
                }
            }
        }

        fetchUserData()
    }, [isOpen, userId])

    useEffect(() => {
        if (view === "edit-profile") setEditForm(profileData)
        if (view === "change-password") setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
        if (view === "shadow-accounts") fetchShadows()
    }, [view, profileData])

    const fetchShadows = async () => {
        setFetchingShadows(true)
        const res = await getShadowAccounts()
        if (res.success) setShadows(res.shadows || [])
        setFetchingShadows(false)
    }

    const handleCreateShadow = async () => {
        setLoading(true)
        const res = await createShadowAccount()
        if (res.success) {
            await fetchShadows()
        } else {
            alert(res.error || "Failed to create shadow account")
        }
        setLoading(false)
    }

    const handleImpersonate = async (id: string) => {
        setLoading(true)
        const res = await impersonateShadowAccount(id)
        if (res.success) {
            router.push("/dashboard")
            router.refresh()
            onClose()
        } else {
            alert(res.error || "Switch failed")
        }
        setLoading(false)
    }


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
                alert("System Error: Failed to update profile details.")
            }
        } catch (error) {
            alert("Unexpected system interruption.")
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
                setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
                setView("profile")
            } else {
                alert(result.error || "Security Validation Failed.")
            }
        } catch (error) {
            alert("Security matrix interruption.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        router.push("/login")
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* High-Fidelity Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                ref={popupRef}
                className="relative z-10 w-full max-w-md"
            >
                <div className="w-full bg-[#0f172a]/95 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl relative">

                    {/* Background Graphic */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between p-8 pb-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                                <ShieldCheck className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-widest">
                                    {view === "profile" && "Administrator Portal"}
                                    {view === "edit-profile" && "Edit Profile"}
                                    {view === "change-password" && "Security Settings"}
                                    {view === "shadow-accounts" && "Shadow Account Matrix"}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Status: Authorized</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ rotate: 90, backgroundColor: "rgba(255,255,255,0.05)" }}
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {fetching ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-6">
                            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-teal-500 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse italic">Loading Profile Data...</p>
                        </div>
                    ) : (
                        <div className="p-8 pt-4 relative z-10">
                            <AnimatePresence mode="wait">
                                {/* VIEW: PROFILE */}
                                {view === "profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        {/* Avatar Section */}
                                        <div className="flex flex-col items-center py-4">
                                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                                                <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <User className="w-10 h-10 text-teal-400 relative z-10" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mt-6 uppercase italic tracking-tighter">{profileData.name}</h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                                <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">System Administrator</p>
                                            </div>
                                        </div>

                                        {/* Info Rows */}
                                        <div className="space-y-3 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                                            <InfoRow icon={Terminal} label="Employee ID" value={profileData.employeeId} />
                                            <InfoRow icon={Phone} label="Contact Number" value={profileData.mobile} />
                                            <InfoRow icon={MapPin} label="Primary Location" value={profileData.location} />
                                            <InfoRow icon={Building} label="Sector / Unit" value={profileData.department} />
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <ActionButton onClick={() => setView("edit-profile")} icon={Pencil} label="Modify" />
                                            <ActionButton onClick={() => setView("change-password")} icon={KeyRound} label="Security" />
                                        </div>

                                        <button
                                            onClick={() => setView("shadow-accounts")}
                                            className="w-full flex items-center justify-between gap-4 p-5 rounded-[2rem] bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                                                    <UserSquare2 className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest italic">Shadow Account Portal</p>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Test driver experience</p>
                                                </div>
                                            </div>
                                            <Terminal className="w-4 h-4 text-slate-700 group-hover:text-teal-500 transition-colors" />
                                        </button>

                                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 mt-4 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-[0.3em] italic border border-transparent hover:border-rose-500/20">
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </motion.div>
                                )}

                                {/* VIEW: EDIT PROFILE */}
                                {view === "edit-profile" && (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <InputGroup label="Employee ID" value={editForm.employeeId} icon={Terminal} readOnly />
                                            <InputGroup label="Full Name" value={editForm.name} icon={User} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })} />
                                            <InputGroup label="Contact Number" value={editForm.mobile} icon={Phone} onChange={(e: any) => setEditForm({ ...editForm, mobile: e.target.value })} />
                                            <InputGroup label="Primary Location" value={editForm.location} icon={MapPin} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} />
                                        </div>
                                        <div className="flex gap-4 pt-6">
                                            <ActionButton onClick={() => setView("profile")} label="Cancel" variant="secondary" />
                                            <ActionButton onClick={handleEditSubmit} label={loading ? "Saving..." : "Save Changes"} primary disabled={loading} />
                                        </div>
                                    </motion.div>
                                )}

                                {/* VIEW: CHANGE PASSWORD */}
                                {view === "change-password" && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <InputGroup label="Current Password" type="password" value={passwordForm.oldPassword} icon={Lock} onChange={(e: any) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
                                            <InputGroup label="New Password" type="password" value={passwordForm.newPassword} icon={KeyRound} onChange={(e: any) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                            <InputGroup label="Confirm Password" type="password" value={passwordForm.confirmPassword} icon={KeyRound} onChange={(e: any) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />

                                            {passwordForm.newPassword && passwordForm.confirmPassword &&
                                                passwordForm.newPassword !== passwordForm.confirmPassword && (
                                                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest px-2 italic">Passwords do not match.</p>
                                                )}
                                        </div>
                                        <div className="flex gap-4 pt-6">
                                            <ActionButton onClick={() => setView("profile")} label="Cancel" variant="secondary" />
                                            <ActionButton onClick={handlePasswordSubmit} label={loading ? "Updating..." : "Update Password"} primary disabled={loading} />
                                        </div>
                                    </motion.div>
                                )}

                                {/* VIEW: SHADOW ACCOUNTS */}
                                {view === "shadow-accounts" && (
                                    <motion.div
                                        key="shadows"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Active Shadow Identities</p>
                                            <button
                                                onClick={handleCreateShadow}
                                                disabled={loading}
                                                className="text-[9px] font-black text-teal-400 border border-teal-400/20 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-teal-400/10 transition-colors flex items-center gap-2"
                                            >
                                                {loading ? "..." : "+ New Shadow"}
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            {fetchingShadows ? (
                                                <div className="py-10 text-center">
                                                    <div className="w-6 h-6 border-2 border-white/5 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Syncing Matrix...</p>
                                                </div>
                                            ) : shadows.length === 0 ? (
                                                <div className="py-10 text-center border border-white/5 bg-white/[0.02] rounded-3xl">
                                                    <UserSquare2 className="w-8 h-8 text-slate-500/20 mx-auto mb-3" />
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">
                                                        No shadow accounts detected.<br />Initialize one to begin testing.
                                                    </p>
                                                </div>
                                            ) : (
                                                shadows.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-teal-500/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-teal-400/50 group-hover:text-teal-400 transition-colors">
                                                                <Terminal className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-slate-200 uppercase italic tracking-tight">{s.full_name}</p>
                                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{s.employee_id}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleImpersonate(s.id)}
                                                            className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 text-slate-950 transition-all"
                                                        >
                                                            Switch
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <button onClick={() => setView("profile")} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">
                                            Return to Profile
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-5 p-3 group border-b border-white/5 last:border-0">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-teal-500/30 transition-all">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-[9px] uppercase tracking-[0.2em] font-black">{label}</p>
                <p className="text-slate-200 text-[13px] font-black truncate uppercase italic tracking-tight">{value}</p>
            </div>
        </div>
    )
}

function InputGroup({ label, icon: Icon, value, onChange, type = "text", readOnly }: any) {
    return (
        <div>
            <label className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all ${readOnly
                ? 'bg-black/40 border-white/5 opacity-60'
                : 'bg-black/40 border-white/10 focus-within:border-teal-500/50 focus-within:bg-black/60 shadow-inner'
                }`}>
                <Icon className={`w-4 h-4 ${readOnly ? 'text-slate-700' : 'text-slate-500'}`} />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    className={`flex-1 bg-transparent text-[14px] font-black uppercase italic tracking-tight outline-none ${readOnly ? 'text-slate-600 cursor-not-allowed' : 'text-slate-200 placeholder:text-slate-800'
                        }`}
                />
            </div>
        </div>
    )
}

function ActionButton({ onClick, label, icon: Icon, primary, variant, disabled }: any) {
    const baseClass = "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed italic"
    const styles = primary
        ? "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-xl shadow-teal-500/20"
        : variant === "secondary"
            ? "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
            : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5"

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${styles}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </motion.button>
    )
}