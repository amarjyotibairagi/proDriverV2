"use client"

import { useState, useEffect } from "react"
import { X, User, BookOpen, Clock, Calendar, CheckCircle2, Trash2, Mail, Phone, Building2, Globe, Shield, MapPin, Briefcase, Activity, Target } from "lucide-react"
import { getUserAssignmentDetails, deleteAssignment } from "@/app/actions/assignments"
import { motion, AnimatePresence } from "framer-motion"

interface UserDetailsPopupProps {
    userId: string
    onClose: () => void
    onUpdate: () => void
}

export function UserDetailsPopup({ userId, onClose, onUpdate }: UserDetailsPopupProps) {
    const [userData, setUserData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadDetails = async () => {
        setIsLoading(true)
        const res = await getUserAssignmentDetails(userId)
        if (res.success) {
            setUserData(res.data)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        loadDetails()
    }, [userId])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return
        const res = await deleteAssignment(id)
        if (res.success) {
            loadDetails()
            onUpdate()
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            case 'ONGOING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            case 'NOT_STARTED': return 'text-slate-500 bg-white/5 border-white/5'
            default: return 'text-slate-500'
        }
    }

    const DetailItem = ({ icon: Icon, label, value, color = "text-slate-500" }: any) => (
        <div className="flex flex-col gap-2 p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
            <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] group-hover:text-slate-400 transition-colors">{label}</span>
            </div>
            <p className="text-[13px] font-black text-slate-200 truncate uppercase italic tracking-tight">{value || 'UNSPECIFIED'}</p>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-[#0f172a]/95 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-3xl"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

                <motion.button
                    whileHover={{ rotate: 90, backgroundColor: "rgba(255,255,255,0.05)" }}
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-2xl transition-all text-slate-500 hover:text-white z-20 border border-transparent hover:border-white/10"
                >
                    <X className="w-5 h-5" />
                </motion.button>

                {isLoading ? (
                    <div className="p-32 flex flex-col items-center justify-center gap-8">
                        <div className="w-16 h-16 border-4 border-white/5 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-[10px] text-slate-500 animate-pulse font-black uppercase tracking-[0.4em] italic text-center">Loading User Details...</p>
                    </div>
                ) : userData ? (
                    <>
                        {/* Header Area */}
                        <div className="p-10 pb-8 relative z-10 border-b border-white/5">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 flex items-center justify-center shadow-2xl shrink-0 group">
                                    <div className="absolute inset-0 bg-teal-500/5 blur-xl group-hover:opacity-100 transition-opacity" />
                                    <User className="w-12 h-12 text-teal-400 relative z-10" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-3xl font-black text-white tracking-tighter truncate uppercase italic leading-none">{userData.full_name}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                        <span className="px-4 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[10px] font-black text-teal-400 uppercase tracking-widest italic outline outline-1 outline-teal-500/5">
                                            {userData.role}
                                        </span>
                                        {userData.is_test_account && (
                                            <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-widest italic animate-pulse">
                                                TEST ACCOUNT
                                            </span>
                                        )}
                                        <div className="h-4 w-px bg-white/10" />
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">ID: {userData.employee_id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                            {/* Profile Details Grid */}
                            <div className="p-10 space-y-10">
                                <div className="animate-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
                                        Employment Details
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <DetailItem icon={Shield} label="Employee ID" value={userData.employee_id} color="text-teal-400" />
                                        <DetailItem icon={Building2} label="Company" value={userData.company} />
                                        <DetailItem icon={Globe} label="Language" value={userData.preferred_language.toUpperCase()} />
                                        <DetailItem icon={Briefcase} label="Department" value={userData.department?.name} />
                                        <DetailItem icon={MapPin} label="Home Location" value={userData.home_location?.name} />
                                        <DetailItem icon={Target} label="Assigned Location" value={userData.assigned_location?.name} />
                                    </div>
                                </div>

                                <div className="animate-in slide-in-from-bottom-2 duration-700">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DetailItem icon={Mail} label="Email" value={userData.email} color="text-amber-400" />
                                        <DetailItem icon={Phone} label="Mobile" value={userData.mobile_number} color="text-amber-400" />
                                    </div>
                                </div>

                                {/* Assignments Section */}
                                <div className="animate-in slide-in-from-bottom-2 duration-1000">
                                    <div className="flex items-center justify-between mb-8 group">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                                            Training Assignments
                                        </h3>
                                        <div className="px-4 py-1.5 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3 shadow-inner">
                                            <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                                                {userData.assignments_received.length} Active
                                            </span>
                                        </div>
                                    </div>

                                    {userData.assignments_received.length === 0 ? (
                                        <div className="p-16 text-center bg-black/20 rounded-[3rem] border-2 border-dashed border-white/5 group hover:border-white/10 transition-all">
                                            <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.3em] italic">No active assignments found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userData.assignments_received.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="group relative p-6 bg-black/40 hover:bg-black/60 border border-white/5 rounded-[2.5rem] transition-all overflow-hidden"
                                                >
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-4 mb-3">
                                                                <h4 className="text-[15px] font-black text-slate-100 uppercase italic tracking-tighter">{item.module.title}</h4>
                                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getStatusStyles(item.training_status)}`}>
                                                                    {item.training_status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 h-2 bg-slate-900 shadow-inner rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${item.training_status === 'COMPLETED' ? 100 : item.training_status === 'ONGOING' ? 50 : 0}%` }}
                                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                                        className={`h-full shadow-[0_0_15px_rgba(20,184,166,0.2)] ${item.training_status === 'COMPLETED' ? 'bg-emerald-500' :
                                                                            item.training_status === 'ONGOING' ? 'bg-amber-500' : 'bg-slate-700'
                                                                            }`}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-black text-slate-500 w-12 text-right">
                                                                    {item.training_status === 'COMPLETED' ? '100%' : item.training_status === 'ONGOING' ? '50%' : '0%'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                                                            <div className="text-right">
                                                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Score</p>
                                                                <p className="text-2xl font-black text-white italic leading-none">{item.marks_obtained} <span className="text-[10px] opacity-20 not-italic uppercase font-bold ml-1">/ {item.module.total_marks}</span></p>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(244,63,94,0.1)" }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-3 text-slate-600 hover:text-rose-500 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="w-3.5 h-3.5 opacity-40 text-teal-400" />
                                                            Assigned: <span className="text-slate-500 italic">{new Date(item.assigned_date).toLocaleDateString()}</span>
                                                        </div>
                                                        {item.due_date && (
                                                            <div className="flex items-center gap-2 text-amber-500/60 border-l border-white/5 pl-6">
                                                                <Clock className="w-3.5 h-3.5 opacity-50" />
                                                                Deadline: <span className="text-amber-500/80 italic">{new Date(item.due_date).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-black/40 border-t border-white/5 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl italic"
                            >
                                Close Details
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <div className="p-32 text-center">
                        <p className="text-rose-500 font-black uppercase tracking-[0.3em] italic animate-pulse">Error: User not found.</p>
                    </div>
                )}
            </motion.div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>
        </div>
    )
}
