"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, RefreshCcw, ChevronLeft, ChevronRight, BookOpen, Layers, Send, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AssignmentTable } from "./assignment-table"
import { AssignModulePopup } from "./assign-module-popup"
import { UserSelectionTable } from "./user-selection-table"
import { AdvancedFilters } from "./advanced-filters"
import { UserDetailsPopup } from "./user-details-popup"
import { getAssignments, getModules, createAssignments, getUsersForAssignment } from "@/app/actions/assignments"
import { exportAssignmentsCSV } from "@/app/actions/csv-export"
import { getMasterData } from "@/app/actions/master-data"

export function AssignmentManager() {
    const [mode, setMode] = useState<'VIEW' | 'ASSIGN'>('VIEW')
    const [assignments, setAssignments] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [modules, setModules] = useState<any[]>([])
    const [masterData, setMasterData] = useState<any>({ teams: [], locations: [] })
    const [isLoading, setIsLoading] = useState(true)

    // Popup States
    const [showAssignPopup, setShowAssignPopup] = useState(false)
    const [selectedUserIdForDetails, setSelectedUserIdForDetails] = useState<string | null>(null)

    // Selection state (Assign Mode)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    // Unified Filters
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filters, setFilters] = useState({
        search: "",
        statuses: [] as string[],
        moduleIds: [] as string[],
        selectedDepts: [] as string[],
        selectedDepots: [] as string[],
        selectedAssignedLocs: [] as string[]
    })

    const loadAssignments = useCallback(async () => {
        setIsLoading(true)
        const result = await getAssignments(page, {
            search: filters.search,
            statuses: filters.statuses,
            moduleIds: filters.moduleIds,
            departmentIds: filters.selectedDepts,
            depotIds: filters.selectedDepots,
            assignedLocationIds: filters.selectedAssignedLocs
        })
        if (result.success && result.data) {
            setAssignments(result.data)
            setTotalPages(result.pagination?.totalPages || 1)
        } else {
            setAssignments([])
            setTotalPages(1)
        }
        setIsLoading(false)
    }, [page, filters])

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        const result = await getUsersForAssignment({
            search: filters.search,
            departmentIds: filters.selectedDepts,
            depotIds: filters.selectedDepots,
            assignedLocationIds: filters.selectedAssignedLocs
        })
        if (result.success && result.data) {
            setUsers(result.data)
        } else {
            setUsers([])
        }
        setIsLoading(false)
    }, [filters])

    const loadInitialDeps = async () => {
        const [mRes, mdRes] = await Promise.all([
            getModules(),
            getMasterData()
        ])
        if (mRes.success && mRes.data) setModules(mRes.data)
        setMasterData(mdRes)
    }

    useEffect(() => {
        if (mode === 'VIEW') loadAssignments()
        else loadUsers()
    }, [mode, loadAssignments, loadUsers])

    useEffect(() => {
        loadInitialDeps()
    }, [])

    const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const handleBulkAssign = async (formData: any) => {
        const res = await createAssignments({
            userIds: selectedUserIds,
            moduleIds: formData.moduleIds,
            dueDate: formData.dueDate
        })

        if (res.success) {
            setShowAssignPopup(false)
            setSelectedUserIds([])
            setMode('VIEW')
            loadAssignments()
        } else {
            alert(res.error || "Failed to assign modules")
        }
    }

    const handleToggleUserSelection = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleToggleAllSelection = () => {
        if (users.length === 0) return
        const allCurrentSelected = users.every(u => selectedUserIds.includes(u.id))
        if (allCurrentSelected) {
            const currentIds = users.map(u => u.id)
            setSelectedUserIds(prev => prev.filter(id => !currentIds.includes(id)))
        } else {
            const newIds = users.map(u => u.id).filter(id => !selectedUserIds.includes(id))
            setSelectedUserIds(prev => [...prev, ...newIds])
        }
    }

    return (
        <div className="space-y-8">

            {/* Header & Tabs - Increased contrast background */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex p-1.5 bg-[#0f172a]/90 border border-white/10 rounded-[2rem] w-fit relative shadow-2xl backdrop-blur-xl">
                    <button
                        onClick={() => setMode('VIEW')}
                        className={`relative z-10 px-8 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-3 uppercase italic tracking-widest ${mode === 'VIEW' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        {mode === 'VIEW' && (
                            <motion.div
                                layoutId="assignModeTab"
                                className="absolute inset-0 bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Layers className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Assignment Overview</span>
                    </button>
                    <button
                        onClick={() => setMode('ASSIGN')}
                        className={`relative z-10 px-8 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-3 uppercase italic tracking-widest ${mode === 'ASSIGN' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        {mode === 'ASSIGN' && (
                            <motion.div
                                layoutId="assignModeTab"
                                className="absolute inset-0 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Send className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">New Assignment</span>
                    </button>
                </div>

                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                            const result = await exportAssignmentsCSV()
                            if (result.success && result.csv) {
                                const blob = new Blob([result.csv], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = result.filename!
                                a.click()
                                window.URL.revokeObjectURL(url)
                            } else {
                                alert("Failed to export Assignment report")
                            }
                        }}
                        className="p-3.5 bg-[#0f172a]/90 hover:bg-slate-800 text-teal-400 rounded-2xl transition-all border border-white/10 shadow-2xl"
                        title="Download Assignment Report"
                    >
                        <Download className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ rotate: 180, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => mode === 'VIEW' ? loadAssignments() : loadUsers()}
                        className="p-3.5 bg-[#0f172a]/90 hover:bg-slate-800 text-teal-400 rounded-2xl transition-all border border-white/10 shadow-2xl"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>
            </div>

            {/* Shared Advanced Filter Section */}
            <div className="space-y-6">
                <AdvancedFilters
                    search={filters.search}
                    onSearchChange={(v) => handleUpdateFilter('search', v)}
                    departments={masterData.teams || []}
                    locations={masterData.locations}
                    selectedDepts={filters.selectedDepts}
                    onDeptsChange={(v) => handleUpdateFilter('selectedDepts', v)}
                    selectedDepots={filters.selectedDepots}
                    onDepotsChange={(v) => handleUpdateFilter('selectedDepots', v)}
                    selectedAssignedLocs={filters.selectedAssignedLocs}
                    onAssignedLocsChange={(v) => handleUpdateFilter('selectedAssignedLocs', v)}

                    showExtendedFilters={mode === 'VIEW'}
                    selectedStatuses={filters.statuses}
                    onStatusesChange={(v) => handleUpdateFilter('statuses', v)}
                    selectedModuleIds={filters.moduleIds}
                    onModuleIdsChange={(v) => handleUpdateFilter('moduleIds', v)}
                    modules={modules}
                />

                {/* Selection Toolbar (Assign Mode) */}
                <AnimatePresence>
                    {mode === 'ASSIGN' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            className="flex items-center justify-between px-8 py-6 bg-[#0f172a]/90 border border-teal-500/20 rounded-[2.5rem] shadow-2xl backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                                    Selected Users: <span className="text-teal-500 text-xl ml-4 not-italic">{selectedUserIds.length}</span>
                                </span>
                                {selectedUserIds.length > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedUserIds([])}
                                        className="text-[10px] uppercase tracking-[0.3em] font-black text-rose-500 hover:text-rose-400 transition-colors border-b border-rose-500/20 italic"
                                    >
                                        Clear Selection
                                    </motion.button>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={selectedUserIds.length === 0}
                                onClick={() => setShowAssignPopup(true)}
                                className="px-10 py-4 bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 text-xs font-black rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(20,184,166,0.3)] disabled:opacity-20 disabled:grayscale transition-all uppercase italic tracking-widest"
                            >
                                Assign Modules
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-8 bg-[#0f172a]/80 glass-card rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-[6px] border-white/5 border-t-teal-500 rounded-full shadow-[0_0_50px_rgba(20,184,166,0.2)]"
                    />
                    <p className="text-[11px] text-slate-400 font-black animate-pulse uppercase tracking-[0.5em] italic">Loading assignments...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AnimatePresence mode="wait">
                        {mode === 'VIEW' ? (
                            <motion.div
                                key="view-table"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AssignmentTable
                                    assignments={assignments}
                                    onViewDetails={(id) => setSelectedUserIdForDetails(id)}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="assign-table"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UserSelectionTable
                                    users={users}
                                    selectedUserIds={selectedUserIds}
                                    onToggleUser={handleToggleUserSelection}
                                    onToggleAll={handleToggleAllSelection}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {mode === 'VIEW' && totalPages > 1 && (
                        <div className="flex items-center justify-between bg-[#0f172a]/95 px-12 py-6 rounded-[2.5rem] border border-white/10 mt-10 shadow-2xl backdrop-blur-xl">
                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] italic">
                                Page <span className="text-teal-400 text-lg mx-2 not-italic">{page}</span>
                                <span className="text-slate-800 mx-3">/</span> {totalPages}
                            </p>
                            <div className="flex gap-6">
                                <motion.button
                                    whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-4 bg-black/40 hover:bg-slate-800 disabled:opacity-10 rounded-2xl transition-all border border-white/10 shadow-inner"
                                >
                                    <ChevronLeft className="w-6 h-6 text-teal-500" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-4 bg-black/40 hover:bg-slate-800 disabled:opacity-10 rounded-2xl transition-all border border-white/10 shadow-inner"
                                >
                                    <ChevronRight className="w-6 h-6 text-teal-500" />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Popups */}
            <AnimatePresence>
                {showAssignPopup && (
                    <AssignModulePopup
                        onClose={() => setShowAssignPopup(false)}
                        onAssign={handleBulkAssign}
                        modules={modules}
                    />
                )}
            </AnimatePresence>

            {selectedUserIdForDetails && (
                <UserDetailsPopup
                    userId={selectedUserIdForDetails}
                    onClose={() => setSelectedUserIdForDetails(null)}
                    onUpdate={loadAssignments}
                />
            )}
        </div>
    )
}
