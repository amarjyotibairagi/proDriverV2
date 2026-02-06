"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAuditLogs } from "@/app/actions/audit"
import { AuditTable } from "./audit-table"
import { AuditFilters } from "./audit-filters"
import { ChevronLeft, ChevronRight, Loader2, Database } from "lucide-react"

export function AuditDashboard() {
    const [logs, setLogs] = useState<any[]>([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 })
    const [isLoading, setIsLoading] = useState(true)

    // Filters
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const fetchLogs = useCallback(async (page: number) => {
        setIsLoading(true)
        const result = await getAuditLogs(page, {
            search,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        })

        if (result.success && result.data) {
            setLogs(result.data)
            if (result.pagination) {
                setPagination({
                    page: result.pagination.page,
                    totalPages: result.pagination.totalPages,
                    totalCount: result.pagination.totalCount
                })
            }
        }
        setIsLoading(false)
    }, [search, startDate, endDate])

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchLogs])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchLogs(newPage)
        }
    }

    return (
        <div className="space-y-6">
            <AuditFilters
                search={search} onSearchChange={setSearch}
                startDate={startDate} onStartDateChange={setStartDate}
                endDate={endDate} onEndDateChange={setEndDate}
            />

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 gap-6 glass-card rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl"
                    >
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="p-4 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                        >
                            <Loader2 className="w-10 h-10 text-teal-500" />
                        </motion.div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic animate-pulse">Scanning System Core...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <AuditTable logs={logs} />

                        {/* Pagination */}
                        {pagination.totalCount > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-600 px-10 py-6 glass-card rounded-[2.5rem] border border-white/5 shadow-2xl bg-black/40 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-slate-800" />
                                    Showing <span className="text-slate-200">{(pagination.page - 1) * 20 + 1}</span> to <span className="text-slate-200">{Math.min(pagination.page * 20, pagination.totalCount)}</span> <span className="text-slate-800 mx-1">/</span> <span className="text-teal-500">{pagination.totalCount}</span> Trace Logs
                                </div>
                                <div className="flex items-center gap-6">
                                    <motion.button
                                        whileHover={{ x: -3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-3 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-10 rounded-2xl transition-all border border-white/10 shadow-inner"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-teal-500" />
                                    </motion.button>
                                    <span className="text-[10px] italic">
                                        Quadrant <span className="text-teal-400 text-lg mx-1">{pagination.page}</span> / {pagination.totalPages}
                                    </span>
                                    <motion.button
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-3 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-10 rounded-2xl transition-all border border-white/10 shadow-inner"
                                    >
                                        <ChevronRight className="w-5 h-5 text-teal-500" />
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
