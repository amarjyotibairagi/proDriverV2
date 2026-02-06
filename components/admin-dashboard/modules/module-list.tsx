"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Book, Clock, Trophy, ChevronRight, Edit } from "lucide-react"

interface ModuleListProps {
    modules: any[]
    selectedId: string | null
    onSelect: (module: any) => void
}

export function ModuleList({ modules, selectedId, onSelect }: ModuleListProps) {
    if (modules.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 glass-card rounded-[2.5rem] border border-white/5 border-dashed bg-slate-900/40">
                <Book className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm font-medium">No modules found.</p>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="h-full overflow-y-auto custom-scrollbar glass-card rounded-[2.5rem] border border-white/5 bg-slate-900/40 divide-y divide-white/5 overflow-hidden"
        >
            {modules.map((module) => (
                <motion.div
                    variants={item}
                    key={module.id}
                    onClick={() => onSelect(module)}
                    className={`relative p-6 cursor-pointer transition-all duration-500 group overflow-hidden ${selectedId === module.id
                        ? 'bg-teal-500/5'
                        : 'hover:bg-white/[0.03]'
                        }`}
                >
                    {/* Active Indicator Bar */}
                    {selectedId === module.id && (
                        <motion.div
                            layoutId="moduleActiveBar"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}

                    <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 min-w-0">
                            <motion.h4
                                animate={{ color: selectedId === module.id ? '#2dd4bf' : '#f1f5f9' }}
                                className="text-[15px] font-black tracking-tight mb-2 uppercase italic"
                            >
                                {module.title}
                            </motion.h4>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock className="w-3.5 h-3.5 opacity-50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{module.duration_minutes} MIN</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-500/70">
                                    <Trophy className="w-3.5 h-3.5 opacity-50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{module.total_marks} PTS</span>
                                </div>
                                <motion.span
                                    layout
                                    className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg border ${module.is_active
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                        : 'text-slate-500 bg-white/5 border-white/5'
                                        }`}
                                >
                                    {module.is_active ? 'ACTIVE REPO' : 'ARCHIVED'}
                                </motion.span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/modules/provision?id=${module.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 hover:bg-teal-500/20 text-slate-500 hover:text-teal-400 rounded-lg transition-colors relative z-20"
                                title="Edit Module"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>

                            <motion.div
                                animate={{
                                    x: selectedId === module.id ? 4 : 0,
                                    opacity: selectedId === module.id ? 1 : 0.3
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <ChevronRight className={`w-5 h-5 ${selectedId === module.id ? 'text-teal-400' : 'text-slate-500'}`} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Subtle Hover Glow Line */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/[0.02] to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </motion.div>
            ))}
        </motion.div>
    )
}
