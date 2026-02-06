"use client"

import { Search, Calendar, Filter, Download } from "lucide-react"
import { motion } from "framer-motion"
import { exportAuditLogsCSV } from "@/app/actions/csv-export"

interface AuditFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    startDate: string
    onStartDateChange: (value: string) => void
    endDate: string
    onEndDateChange: (value: string) => void
}

export function AuditFilters({
    search, onSearchChange,
    startDate, onStartDateChange,
    endDate, onEndDateChange
}: AuditFiltersProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-teal-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Scan Directive, Originator, or Target Node ID..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600 uppercase tracking-widest shadow-inner group-hover:bg-slate-900/60"
                />
            </div>

            {/* Date Range */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-none">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Start</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full sm:w-48 bg-slate-900/40 border border-white/5 rounded-2xl pl-20 pr-4 py-4 text-[10px] font-black text-slate-300 focus:outline-none focus:border-teal-500/50 transition-all [color-scheme:dark] uppercase tracking-widest shadow-inner"
                    />
                </div>
                <div className="relative flex-1 sm:flex-none">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">End</span>
                    </div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full sm:w-48 bg-slate-900/40 border border-white/5 rounded-2xl pl-20 pr-4 py-4 text-[10px] font-black text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all [color-scheme:dark] uppercase tracking-widest shadow-inner"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        onSearchChange('')
                        onStartDateChange('')
                        onEndDateChange('')
                    }}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest italic"
                >
                    Reset Vector
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                        const result = await exportAuditLogsCSV()
                        if (result.success && result.csv) {
                            const blob = new Blob([result.csv], { type: 'text/csv' })
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = result.filename!
                            a.click()
                            window.URL.revokeObjectURL(url)
                        } else {
                            alert("Failed to export Audit Logs")
                        }
                    }}
                    className="px-6 py-4 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-2xl text-[10px] font-black text-teal-400 hover:text-teal-300 transition-all uppercase tracking-widest flex items-center gap-2 italic"
                >
                    <Download className="w-4 h-4" />
                    Export Log
                </motion.button>
            </div>
        </div>
    )
}
