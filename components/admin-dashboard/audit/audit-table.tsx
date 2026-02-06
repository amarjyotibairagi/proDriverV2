"use client"

import { format } from "date-fns"
import { motion } from "framer-motion"
import { Shield, User, Clock, Terminal, Activity, Eye, Zap } from "lucide-react"

interface AuditLog {
    id: string
    action: string
    actor: {
        full_name: string
        email: string | null
        role: string
    }
    target_id: string | null
    metadata: any
    timestamp: Date
}

export function AuditTable({ logs }: { logs: AuditLog[] }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    }

    if (!logs || logs.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-20 text-center rounded-[3rem] border border-white/5 bg-slate-900/40 shadow-2xl"
            >
                <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                    <Terminal className="w-10 h-10 text-slate-600 opacity-30" />
                </div>
                <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] mb-2 italic">Null Event Buffer</h3>
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No activity signatures detected in current sector.</p>
            </motion.div>
        )
    }

    return (
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="overflow-x-auto min-w-[800px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-8 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Temporal Ref</th>
                            <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Originator</th>
                            <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Directive</th>
                            <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Target Matrix</th>
                        </tr>
                    </thead>
                    <motion.tbody
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="divide-y divide-white/5"
                    >
                        {logs.map((log) => (
                            <motion.tr
                                variants={item}
                                key={log.id}
                                className="group hover:bg-white/[0.04] transition-all relative overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-indigo-500/20 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity"
                            >
                                {/* Timestamp */}
                                <td className="p-8 pl-10 whitespace-nowrap">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 shadow-inner group-hover:border-teal-500/30 transition-colors">
                                            <Clock className="w-4 h-4 text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-slate-200 uppercase tracking-tight italic">
                                                {format(new Date(log.timestamp), "MMM dd, yyyy")}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
                                                {format(new Date(log.timestamp), "HH:mm:ss:SSS")}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Actor */}
                                <td className="p-8">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center border border-white/10 shadow-2xl"
                                        >
                                            <User className="w-6 h-6 text-indigo-400" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[15px] font-black text-slate-100 group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">{log.actor.full_name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {log.actor.role === 'ADMIN' && (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest shadow-lg shadow-amber-500/5">
                                                        <Shield className="w-3 h-3" /> ARCHITECT
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[150px]">{log.actor.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Action */}
                                <td className="p-8">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                                        <span className="px-4 py-2 rounded-xl text-[10px] font-black bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase tracking-[0.2em] shadow-lg shadow-teal-500/5 italic">
                                            {log.action}
                                        </span>
                                    </div>
                                </td>

                                {/* Target / Details */}
                                <td className="p-8">
                                    <div className="max-w-xs relative z-10">
                                        {log.target_id && (
                                            <div className="flex items-center gap-2 mb-2 group/id">
                                                <Zap className="w-3.5 h-3.5 text-slate-700 group-hover/id:text-amber-500 transition-colors" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                                                    ID: <span className="text-slate-300 italic">{log.target_id}</span>
                                                </p>
                                            </div>
                                        )}
                                        {log.metadata && (
                                            <div className="flex items-start gap-2">
                                                <Eye className="w-3.5 h-3.5 text-slate-800 mt-0.5" />
                                                <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-tight line-clamp-2">
                                                    {JSON.stringify(log.metadata).replace(/[{}"[\]]/g, ' ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>
        </div>
    )
}
