"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, RefreshCcw, Layout, Activity, Database, Download } from "lucide-react"
import { getModules, getModuleAnalytics } from "@/app/actions/modules"
import { exportModulesCSV } from "@/app/actions/csv-export"
import { ModuleList } from "./module-list"
import { ModuleStats } from "./module-stats"
import { ComingSoon } from "./coming-soon"

export function ModuleManager() {
    const [mode, setMode] = useState<'EXISTING' | 'ADD'>('EXISTING')
    const [modules, setModules] = useState<any[]>([])
    const [selectedModule, setSelectedModule] = useState<any>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isStatsLoading, setIsStatsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadModules = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        const res = await getModules()
        if (res.success && res.data) {
            setModules(res.data)
            // Pick the first module that has assignments, or fall back to the first one available
            if (res.data.length > 0 && !selectedModule) {
                const defaultModule = res.data.find((m: any) => m._count?.assignments > 0) || res.data[0]
                setSelectedModule(defaultModule)
            }
        } else {
            setError("Failed to initialize instruction catalog")
        }
        setIsLoading(false)
    }, [selectedModule])

    const loadAnalytics = useCallback(async (moduleId: string | number) => {
        setIsStatsLoading(true)
        const res = await getModuleAnalytics(moduleId)
        if (res.success) {
            setAnalytics(res.data)
        } else {
            console.error(res.error)
            setAnalytics(null)
        }
        setIsStatsLoading(false)
    }, [])

    useEffect(() => {
        loadModules()
    }, [])

    useEffect(() => {
        if (selectedModule?.id && mode === 'EXISTING') {
            loadAnalytics(selectedModule.id)
        }
    }, [selectedModule?.id, mode, loadAnalytics])

    return (
        <div className="space-y-8">

            {/* Navigation Tabs - Increased Contrast */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex p-1.5 bg-[#0f172a]/95 border border-white/10 rounded-[2rem] w-fit relative shadow-2xl backdrop-blur-xl">
                    <button
                        onClick={() => setMode('EXISTING')}
                        className={`relative px-8 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 flex items-center gap-3 z-10 uppercase italic tracking-widest ${mode === 'EXISTING' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-200'
                            }`}
                    >
                        {mode === 'EXISTING' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Layout className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Existing Repository</span>
                    </button>
                    <a
                        href="/admin/modules/provision"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative px-8 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 flex items-center gap-3 z-10 uppercase italic tracking-widest text-slate-500 hover:text-slate-200`}
                    >
                        <Plus className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Provision Module</span>
                    </a>
                </div>

                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                            const result = await exportModulesCSV()
                            if (result.success && result.csv) {
                                const blob = new Blob([result.csv], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = result.filename!
                                a.click()
                                window.URL.revokeObjectURL(url)
                            } else {
                                alert("Failed to export Module analytics")
                            }
                        }}
                        className="p-3.5 bg-[#0f172a]/95 hover:bg-slate-800 text-teal-400 rounded-2xl transition-all border border-white/10 shadow-2xl"
                        title="Download Attendance Analytics"
                    >
                        <Download className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        onClick={loadModules}
                        className="p-3.5 bg-[#0f172a]/95 hover:bg-slate-800 text-teal-400 rounded-2xl transition-all border border-white/10 shadow-2xl"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>
            </div>

            {/* Content Area with AnimatePresence */}
            <AnimatePresence mode="wait">
                {mode === 'EXISTING' ? (
                    <motion.div
                        key="existing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]"
                    >

                        {/* Left: Module List */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6 px-4">
                                <Database className="w-4 h-4 text-teal-500" />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic">Instruction Catalog</h3>
                            </div>
                            <div className="flex-1 min-h-0">
                                {isLoading ? (
                                    <div className="h-full flex items-center justify-center bg-[#0f172a]/80 glass-card rounded-[3rem] border border-white/10">
                                        <motion.div
                                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="w-16 h-16 border-[6px] border-white/5 border-t-teal-500 rounded-full shadow-2xl shadow-teal-500/20"
                                        />
                                    </div>
                                ) : (
                                    <ModuleList
                                        modules={modules}
                                        selectedId={selectedModule?.id}
                                        onSelect={setSelectedModule}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right: Analytics */}
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="flex items-center justify-between mb-6 px-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic">Telemetry Analysis</h3>
                                </div>
                                {selectedModule && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[10px] font-black text-teal-400 bg-teal-500/10 px-4 py-1.5 rounded-xl border border-teal-500/20 uppercase tracking-widest italic"
                                    >
                                        Module: {selectedModule.title}
                                    </motion.span>
                                )}
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#0f172a]/95 glass-card rounded-[3rem] border border-white/10 p-8 shadow-2xl backdrop-blur-2xl relative">
                                {isStatsLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-6">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/10"
                                        >
                                            <Activity className="w-8 h-8 text-amber-500" />
                                        </motion.div>
                                        <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.3em] animate-pulse italic">Synthesizing Data Pathing...</p>
                                    </div>
                                ) : (
                                    <ModuleStats analytics={analytics} />
                                )}
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        key="add"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                    >
                        <ComingSoon />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}
