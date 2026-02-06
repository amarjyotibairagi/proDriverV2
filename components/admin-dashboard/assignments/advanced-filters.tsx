"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, Search, X, Filter, Target } from "lucide-react"

interface Option {
    id: string
    name: string
}

interface MultiSelectProps {
    label: string
    options: Option[]
    selected: string[]
    onChange: (ids: string[]) => void
    placeholder?: string
    minWidth?: string
}

function MultiSelect({ label, options, selected, onChange, placeholder = "Select...", minWidth = "160px" }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleOption = (id: string) => {
        if (id === 'ALL') {
            onChange([])
            return
        }
        const newSelected = selected.includes(id)
            ? selected.filter(i => i !== id)
            : [...selected, id]
        onChange(newSelected)
    }

    const selectedNames = options
        .filter(o => selected.includes(o.id))
        .map(o => o.name)

    return (
        <div className="relative flex flex-col gap-1.5 flex-1" style={{ minWidth }} ref={containerRef}>
            <div className="flex items-center gap-1.5 ml-1">
                <Target className="w-2.5 h-2.5 text-slate-600" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{label}</label>
            </div>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-2.5 bg-black/40 border rounded-2xl text-[11px] font-bold transition-all h-[44px] shadow-inner uppercase tracking-tight ${isOpen ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-white/5 hover:border-white/10 hover:bg-black/60'
                    }`}
            >
                <span className={`truncate italic ${selected.length > 0 ? 'text-teal-400' : 'text-slate-500'}`}>
                    {selected.length === 0 ? 'All' : selected.length === 1 ? selectedNames[0] : `${selected.length} Selected`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-500' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[110%] left-0 w-full bg-[#0f172a] border border-white/10 rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-50 py-3 max-h-64 overflow-y-auto backdrop-blur-3xl custom-scrollbar"
                    >
                        <div
                            onClick={() => toggleOption('ALL')}
                            className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-colors"
                        >
                            <span className={selected.length === 0 ? 'text-teal-400 italic' : 'text-slate-500'}>Neutralize All</span>
                            {selected.length === 0 && <Check className="w-4 h-4 text-teal-400" />}
                        </div>
                        <div className="h-px bg-white/5 mx-3 my-2" />
                        {options.map(option => (
                            <div
                                key={option.id}
                                onClick={() => toggleOption(option.id)}
                                className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between text-[11px] font-black uppercase tracking-widest group transition-colors"
                            >
                                <span className={selected.includes(option.id) ? 'text-teal-400 italic' : 'text-slate-400 group-hover:text-slate-200'}>
                                    {option.name}
                                </span>
                                <div className={`w-4 h-4 rounded-lg border-2 flex items-center justify-center transition-all ${selected.includes(option.id) ? 'bg-teal-500 border-teal-500 shadow-lg shadow-teal-500/20' : 'border-slate-800'
                                    }`}>
                                    {selected.includes(option.id) && <Check className="w-3 h-3 text-slate-950" />}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface AdvancedFiltersProps {
    search: string
    onSearchChange: (val: string) => void
    departments: Option[]
    locations: Option[]
    selectedDepts: string[]
    onDeptsChange: (val: string[]) => void
    selectedDepots: string[]
    onDepotsChange: (val: string[]) => void
    selectedAssignedLocs: string[]
    onAssignedLocsChange: (val: string[]) => void

    // VIEW mode filters
    showExtendedFilters?: boolean
    selectedStatuses?: string[]
    onStatusesChange?: (val: string[]) => void
    selectedModuleIds?: string[]
    onModuleIdsChange?: (val: string[]) => void
    modules?: any[]
}

const statusOptions = [
    { id: 'NOT_STARTED', name: 'Not Started' },
    { id: 'ONGOING', name: 'Ongoing' },
    { id: 'COMPLETED', name: 'Completed' }
]

export function AdvancedFilters({
    search, onSearchChange,
    departments, locations,
    selectedDepts, onDeptsChange,
    selectedDepots, onDepotsChange,
    selectedAssignedLocs, onAssignedLocsChange,
    showExtendedFilters = false,
    selectedStatuses = [],
    onStatusesChange,
    selectedModuleIds = [],
    onModuleIdsChange,
    modules = []
}: AdvancedFiltersProps) {

    const depots = locations.filter(l => (l as any).type === 'HOME')
    const assignedLocs = locations.filter(l => (l as any).type === 'ASSIGNED')
    const mappedModules = modules.map(m => ({ id: m.id, name: m.title }))

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-6 items-end bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl relative z-20">
            {/* Search */}
            <div className="flex flex-col gap-1.5 w-full sm:w-[200px]">
                <div className="flex items-center gap-1.5 ml-1">
                    <Search className="w-2.5 h-2.5 text-slate-600" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Search</label>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all h-[44px] uppercase tracking-widest placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* View Mode Specific Filters */}
            {showExtendedFilters && (
                <>
                    <MultiSelect
                        label="Status"
                        options={statusOptions}
                        selected={selectedStatuses}
                        onChange={onStatusesChange || (() => { })}
                        minWidth="160px"
                    />

                    <MultiSelect
                        label="Modules"
                        options={mappedModules}
                        selected={selectedModuleIds}
                        onChange={onModuleIdsChange || (() => { })}
                        minWidth="180px"
                    />
                </>
            )}

            <MultiSelect
                label="Position / Team"
                options={departments}
                selected={selectedDepts}
                onChange={onDeptsChange}
                minWidth="180px"
            />

            <MultiSelect
                label="Home Depot"
                options={depots}
                selected={selectedDepots}
                onChange={onDepotsChange}
                minWidth="160px"
            />

            <MultiSelect
                label="Operational Zone"
                options={assignedLocs}
                selected={selectedAssignedLocs}
                onChange={onAssignedLocsChange}
                minWidth="180px"
            />

            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    onSearchChange("")
                    onDeptsChange([])
                    onDepotsChange([])
                    onAssignedLocsChange([])
                    onStatusesChange?.([])
                    onModuleIdsChange?.([])
                }}
                className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-2xl transition-all border border-white/5 h-[44px] flex items-center justify-center shrink-0 w-[44px] shadow-lg"
                title="Flush Spectrum Analysis"
            >
                <X className="w-5 h-5" />
            </motion.button>
        </div>
    )
}
