"use client"

import { useEffect, useState } from "react"
import { X, BookOpen, CheckCircle, Clock, AlertCircle, Activity, User, ShieldCheck } from "lucide-react"
import { getDriverTrainings } from "@/app/actions/getDriverTrainings"
import { motion, AnimatePresence } from "framer-motion"

interface UserTrainingsPopupProps {
    isOpen: boolean
    onClose: () => void
    userId: string | null
    userName: string
}

export function UserTrainingsPopup({ isOpen, onClose, userId, userName }: UserTrainingsPopupProps) {
    const [loading, setLoading] = useState(false)
    const [trainings, setTrainings] = useState<any[]>([])

    useEffect(() => {
        async function fetchTrainings() {
            if (isOpen && userId) {
                setLoading(true)
                try {
                    const result = await getDriverTrainings(userId)
                    if (result.success) {
                        setTrainings(result.data)
                    } else {
                        setTrainings([])
                    }
                } catch (error) {
                    console.error("Failed to fetch trainings", error)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchTrainings()
    }, [isOpen, userId])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-3xl"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-10 pb-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                            <Activity className="w-7 h-7 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-100 uppercase italic tracking-widest leading-none flex items-center gap-3">
                                Training <span className="text-teal-400">Record</span>
                            </h3>
                            <div className="flex items-center gap-3 mt-3">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]"> Staff: <span className="text-slate-300 italic">{userName}</span></p>
                            </div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ rotate: 90, backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={onClose}
                        className="p-3 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-10 pt-8 custom-scrollbar relative z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-8">
                            <div className="w-16 h-16 border-4 border-white/5 border-t-teal-500 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse italic">Loading Training History...</p>
                        </div>
                    ) : trainings.length > 0 ? (
                        <div className="space-y-4">
                            {trainings.map((training, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={training.id}
                                    className="bg-black/40 border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 hover:border-teal-500/20 hover:bg-black/60 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/20 group-hover:bg-teal-500/50 transition-colors" />

                                    {/* Status Icon */}
                                    <div className={`p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${getStatusStyle(training.training_status)}`}>
                                        {getStatusIcon(training.training_status)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-black text-white mb-2 truncate uppercase italic tracking-tight">{training.module.title}</h4>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-500 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 opacity-50" />
                                                <span>Assigned: {new Date(training.assigned_date).toLocaleDateString()}</span>
                                            </div>
                                            {training.completed_date && (
                                                <div className="flex items-center gap-2 text-emerald-500/70">
                                                    <CheckCircle className="w-3.5 h-3.5 opacity-70" />
                                                    <span>Completed: {new Date(training.completed_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score / Status Badge */}
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border italic ${getStatusBadgeStyle(training.training_status)}`}>
                                            {training.training_status.replace('_', ' ')}
                                        </span>
                                        {training.marks_obtained !== null && training.module.total_marks > 0 && (
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-black italic leading-none ${training.marks_obtained >= (training.module.pass_marks || 0) ? "text-emerald-500" : "text-rose-500"}`}>
                                                    {Math.round((training.marks_obtained / training.module.total_marks) * 100)}
                                                </span>
                                                <span className="text-[10px] text-slate-700 font-black uppercase">%</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-700 gap-6 animate-in fade-in zoom-in duration-500">
                            <BookOpen className="w-20 h-20 stroke-[0.5] opacity-20" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">No training records found.</p>
                        </div>
                    )}
                </div>

                {/* Footer Close Button */}
                <div className="p-10 bg-black/40 border-t border-white/5 flex-shrink-0 relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl italic"
                    >
                        Close View
                    </motion.button>
                </div>

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

function getStatusStyle(status: string) {
    switch (status) {
        case 'COMPLETED': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
        case 'ONGOING': return "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5"
        default: return "bg-slate-900/50 text-slate-600 border border-white/5"
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'COMPLETED': return <ShieldCheck className="w-5 h-5" />
        case 'ONGOING': return <Activity className="w-5 h-5" />
        default: return <Clock className="w-5 h-5" />
    }
}

function getStatusBadgeStyle(status: string) {
    switch (status) {
        case 'COMPLETED': return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-inner"
        case 'ONGOING': return "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-inner"
        default: return "bg-white/5 border-white/10 text-slate-500"
    }
}
