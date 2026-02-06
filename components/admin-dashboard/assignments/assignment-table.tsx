"use client"

import { User, ChevronRight, BookOpen, UserCircle } from "lucide-react"
import { motion } from "framer-motion"

interface AssignmentTableProps {
    assignments: any[]
    onViewDetails: (userId: string) => void
}

export function AssignmentTable({ assignments, onViewDetails }: AssignmentTableProps) {
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

    if (assignments.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-24 text-slate-500 bg-[#0f172a]/95 glass-card rounded-[3rem] border border-white/10 shadow-2xl"
            >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                    <UserCircle className="w-12 h-12 opacity-10" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">No Assignments Found</p>
                <p className="text-[10px] opacity-40 mt-3 uppercase font-bold tracking-widest text-slate-500">Please adjust your filters</p>
            </motion.div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-[3rem] border border-white/10 glass-card shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-[#0f172a]/90 backdrop-blur-2xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-900/50 border-b border-white/10 text-left">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Module</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <motion.tbody
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-white/5"
                >
                    {assignments.map((assignment) => (
                        <motion.tr
                            variants={item}
                            key={assignment.id}
                            onClick={() => onViewDetails(assignment.user_id)}
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                            className="transition-all group cursor-pointer"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-100 truncate">{assignment.user?.full_name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{assignment.user?.employee_id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-200 truncate">{assignment.module?.title}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Ref: {assignment.module_id}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-300 font-medium">
                                        {assignment.user?.department?.name || 'General Fleet'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {assignment.user?.home_location?.name || 'Main Depot'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold w-8">ASN:</span>
                                        <span className="text-xs text-slate-300">{new Date(assignment.assigned_date).toLocaleDateString()}</span>
                                    </div>
                                    {assignment.due_date && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-amber-500/60 uppercase font-bold w-8">DUE:</span>
                                            <span className="text-xs text-amber-500/80">{new Date(assignment.due_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className={`inline-flex px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${assignment.training_status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    assignment.training_status === 'ONGOING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-white/5 text-slate-500 border-white/5'
                                    }`}>
                                    {assignment.training_status?.replace('_', ' ')}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(assignment.user_id);
                                    }}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-teal-400 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </motion.tbody>
            </table>
        </div>
    )
}
