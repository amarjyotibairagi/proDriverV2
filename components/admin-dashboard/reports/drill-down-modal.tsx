
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Download } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DrillDownData {
    id: string
    employeeId: string
    name: string
    module?: string
    status: string
    score?: number
    date: Date
}

interface DrillDownModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    data: DrillDownData[]
    loading?: boolean
}

export function DrillDownModal({ isOpen, onClose, title, data, loading }: DrillDownModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl max-h-[80vh] bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                        <p className="text-sm text-slate-400">
                            {loading ? "Loading data..." : `${data.length} records found`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 min-h-[300px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <ExternalLink className="w-6 h-6 opacity-50" />
                            </div>
                            <p>No records found for this category</p>
                        </div>
                    ) : (
                        <div className="w-full text-left border-collapse">
                            <table className="w-full">
                                <thead className="text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-white/5 bg-slate-900/30 sticky top-0 backdrop-blur-md">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Driver</th>
                                        <th className="px-4 py-3 text-left">Module</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Score</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {data.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{row.name}</div>
                                                <div className="text-xs text-slate-500">{row.employeeId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{row.module || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-1 round-lg text-[10px] font-bold uppercase tracking-wider rounded-md",
                                                    row.status === 'COMPLETED' || row.status === 'PASSED' ? "bg-emerald-500/10 text-emerald-400" :
                                                        row.status === 'FAILED' ? "bg-red-500/10 text-red-400" :
                                                            "bg-amber-500/10 text-amber-400"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {row.score !== undefined ? `${row.score}%` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">
                                                {row.date ? format(new Date(row.date), "MMM dd, yyyy") : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50 shrink-0 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                        Export List
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
