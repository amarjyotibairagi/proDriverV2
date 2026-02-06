"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo, useRef, useEffect } from "react"
import {
    Search,
    Filter,
    MoreVertical,
    Shield,
    MapPin,
    Briefcase,
    UserPlus,
    Mail,
    Smartphone,
    X,
    CheckSquare,
    Square,
    RotateCcw,
    Lock,
    BookOpen,
    User,
    TrendingUp,
    FileText,
    Upload,
    Download,
    Building
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AddUserPopup } from "@/components/admin-dashboard/users/add-user-popup"
import { UserDetailsPopup } from "@/components/admin-dashboard/users/user-details-popup"
import { UserTrainingsPopup } from "@/components/admin-dashboard/users/user-trainings-popup"
import { resetUserPassword } from "@/app/actions/user-management"
import { exportUsersCSV } from "@/app/actions/csv-export"
import { CSVImportWizard } from "@/components/admin-dashboard/users/csv-import-wizard"

interface UserData {
    id: string
    full_name: string
    employee_id: string
    email: string | null
    mobile_number: string | null
    role: string
    team?: { id: string; name: string } | null
    designation?: { id: string; name: string } | null
    company?: string | null
    assigned_location?: { id: string; name: string } | null
    home_location?: { id: string; name: string } | null
    training_stats?: {
        total: number
        completed: number
        ongoing: number
        pending: number
    }
    has_password?: boolean
}

interface FilterState {
    roles: string[]
    teams: string[]
    homeLocations: string[]
    assignedLocations: string[]
}

const INITIAL_FILTERS: FilterState = {
    roles: [],
    teams: [],
    homeLocations: [],
    assignedLocations: []
}

// --- TABS Type ---
type TabType = 'active' | 'pending'

export function UsersTable({
    activeUsers,
    pendingUsers,
    options,
    initialTab = 'active'
}: {
    activeUsers: any[],
    pendingUsers: any[],
    options: any,
    initialTab?: TabType
}) {
    const router = useRouter()
    const [activeTab, setActiveTabState] = useState<TabType>(initialTab)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS)
    const [tempFilters, setTempFilters] = useState<FilterState>(INITIAL_FILTERS)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Popup States
    const [detailsPopupUser, setDetailsPopupUser] = useState<UserData | null>(null)
    const [trainingsPopupUserId, setTrainingsPopupUserId] = useState<{ id: string, name: string } | null>(null)

    // User Actions State
    const [activeActionUserId, setActiveActionUserId] = useState<string | null>(null)

    // Handle initial tab only on mount
    useEffect(() => {
        if (initialTab) setActiveTabState(initialTab)
    }, [])

    // Wrapper to sync URL and clear filters
    const setActiveTab = (tab: TabType) => {
        setActiveTabState(tab)

        // Clear filters
        setSearchTerm("")
        setActiveFilters(INITIAL_FILTERS)
        setTempFilters(INITIAL_FILTERS)

        // Update URL strictly for persistence (Client-side only, no server roundtrip)
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        window.history.replaceState({}, '', url.toString())
    }

    // Refs for Click Outside
    const filterRef = useRef<HTMLDivElement>(null)
    const actionMenuRef = useRef<HTMLDivElement>(null)

    // --- Animation Variants ---
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

    // --- Click Outside & Popstate Logic ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false)
            }
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionUserId(null)
            }
        }

        // Handle Browser Back/Forward for Tab State
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search)
            const tab = params.get('tab') === 'pending' ? 'pending' : 'active'
            setActiveTabState(tab)
        }

        document.addEventListener("mousedown", handleClickOutside)
        window.addEventListener("popstate", handlePopState)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("popstate", handlePopState)
        }
    }, [])

    // --- Filter Logic ---
    const handleFilterChange = (category: keyof FilterState, value: string) => {
        setTempFilters(prev => {
            const current = prev[category]
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value]
            return { ...prev, [category]: updated }
        })
    }

    const applyFilters = () => {
        setActiveFilters(tempFilters)
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setTempFilters(INITIAL_FILTERS)
        setActiveFilters(INITIAL_FILTERS)
    }

    const cancelFilters = () => {
        setTempFilters(activeFilters)
        setIsFilterOpen(false)
    }

    // --- Action Handlers ---
    const handleResetPassword = async (userId: string) => {
        if (confirm("Are you sure you want to reset this user's password?")) {
            const result = await resetUserPassword(userId)
            if (result.success) {
                alert(`Password reset successfully!\nNew Password: ${result.newPassword}`)
            } else {
                alert(`Failed: ${result.error}`)
            }
        }
        setActiveActionUserId(null)
    }

    // --- Dynamic User List based on Tab ---
    const viewUsers = activeTab === 'active' ? activeUsers : pendingUsers

    // --- Filter Execution ---
    const filteredUsers = useMemo(() => {
        return viewUsers.filter((user: any) => {
            // 1. Search Filter
            const searchLower = searchTerm.toLowerCase() || ""

            const fullName = user.full_name ? user.full_name.toLowerCase() : ""
            const empId = user.employee_id ? user.employee_id.toLowerCase() : ""
            const email = user.email ? user.email.toLowerCase() : ""

            const matchesSearch =
                fullName.includes(searchLower) ||
                empId.includes(searchLower) ||
                email.includes(searchLower)

            if (!matchesSearch) return false

            // 2. Role Filter
            if (activeFilters.roles.length > 0 && !activeFilters.roles.includes(user.role)) {
                return false
            }

            // 3. Team Filter
            if (activeFilters.teams.length > 0 && !activeFilters.teams.includes(user.team?.id || "Unassigned")) {
                return false
            }

            // 3.5 Designation Filter (Optional if needed, but adding Team for now)

            // 4. Home Location Filter (Depot)
            if (activeFilters.homeLocations.length > 0 && !activeFilters.homeLocations.includes(user.home_location?.name || "Unassigned")) {
                return false
            }

            // 5. Assigned Location Filter (Site)
            if (activeFilters.assignedLocations.length > 0 && !activeFilters.assignedLocations.includes(user.assigned_location?.name || "Floating Driver")) {
                return false
            }

            return true
        })
    }, [viewUsers, searchTerm, activeFilters])

    const activeFilterCount = Object.values(activeFilters).flat().length;

    return (
        <div className="space-y-6">
            {/* --- Toolbar --- */}
            <div className="relative z-10 glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center transition-all hover:bg-white/[0.02]">

                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-500"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">

                    {/* Filter Dropdown Toggle */}
                    <div className="relative" ref={filterRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setIsFilterOpen(!isFilterOpen); setTempFilters(activeFilters); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${activeFilterCount > 0
                                ? "bg-teal-500 text-slate-950 border-teal-500/50 shadow-lg shadow-teal-500/10"
                                : "bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 bg-black/20 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </motion.button>



                        {/* --- ADVANCED FILTER POPUP --- */}
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-50 shadow-teal-500/5"
                                >
                                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                                        <h4 className="font-black text-slate-200 text-xs uppercase tracking-widest italic">User <span className="text-teal-500">Filter</span></h4>
                                        <button onClick={clearFilters} className="text-[10px] font-black text-teal-400 hover:text-teal-300 flex items-center gap-1.5 uppercase tracking-widest">
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>

                                    <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-900/40">

                                        {/* Roles */}
                                        <FilterSection title="Account Settings">
                                            {['BASIC', 'ADMIN'].map(role => (
                                                <FilterCheckbox
                                                    key={role}
                                                    label={role === 'BASIC' ? 'Driver / Basic' : 'Administrator'}
                                                    checked={tempFilters.roles.includes(role)}
                                                    onChange={() => handleFilterChange('roles', role)}
                                                />
                                            ))}
                                        </FilterSection>

                                        {/* Team */}
                                        <FilterSection title="Team Assignment">
                                            {options?.teams?.map((team: any) => (
                                                <FilterCheckbox
                                                    key={team.id}
                                                    label={team.name}
                                                    checked={tempFilters.teams.includes(team.id)}
                                                    onChange={() => handleFilterChange('teams', team.id)}
                                                />
                                            ))}
                                        </FilterSection>

                                        {/* Home Locations */}
                                        <FilterSection title="Primary Hub">
                                            {options.locations.map((loc: any) => (
                                                <FilterCheckbox
                                                    key={`home-${loc.id}`}
                                                    label={loc.name}
                                                    checked={tempFilters.homeLocations.includes(loc.id)}
                                                    onChange={() => handleFilterChange('homeLocations', loc.id)}
                                                />
                                            ))}
                                        </FilterSection>

                                        {/* Assigned Locations */}
                                        <FilterSection title="Work Location">
                                            {options.locations.map((loc: any) => (
                                                <FilterCheckbox
                                                    key={`assigned-${loc.id}`}
                                                    label={loc.name}
                                                    checked={tempFilters.assignedLocations.includes(loc.id)}
                                                    onChange={() => handleFilterChange('assignedLocations', loc.id)}
                                                />
                                            ))}
                                        </FilterSection>

                                    </div>

                                    <div className="p-5 border-t border-white/10 bg-white/5 flex gap-3">
                                        <button onClick={cancelFilters} className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest border border-white/5">
                                            Cancel
                                        </button>
                                        <button onClick={applyFilters} className="flex-1 py-3 text-[10px] font-black text-slate-950 bg-teal-500 hover:bg-teal-400 rounded-xl transition-all shadow-lg shadow-teal-500/20 uppercase tracking-widest">
                                            Apply Filters
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Export Button - Moved Outside Filter Container for Alignment */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                            const result = await exportUsersCSV(activeTab)
                            if (result.success && result.csv) {
                                const blob = new Blob([result.csv], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = result.filename!
                                a.click()
                                window.URL.revokeObjectURL(url)
                            } else {
                                alert("Failed to export CSV")
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm font-bold"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </motion.button>

                    {/* Import CSV Button */}
                    {/* Add User Button */}
                </div>
            </div>

            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                        User <span className="text-teal-400">Database</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Total Records: <span className="text-white">{viewUsers.length}</span> (A:{activeUsers.length}/P:{pendingUsers.length})
                    </p>
                </div>

                {/* TABS & ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                    {/* TABS */}
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active'
                                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Active <span className="opacity-50 ml-1">({activeUsers.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending'
                                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Pending <span className="opacity-50 ml-1">({pendingUsers.length})</span>
                        </button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Only show Import in Pending Tab */}
                        {activeTab === 'pending' && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsImportOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-teal-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-teal-500/20"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Import CSV</span>
                                </motion.button>

                                <CSVImportWizard
                                    isOpen={isImportOpen}
                                    onClose={() => setIsImportOpen(false)}
                                    onSuccess={() => {
                                        setIsImportOpen(false)
                                        router.refresh()
                                    }}
                                />
                            </>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all border border-teal-400/20"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add User</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/20 backdrop-blur-sm">
                <div className="overflow-x-auto min-h-[400px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Personnel</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Contact</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Organization</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Logistics</th>
                                {activeTab === 'active' && (
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Training Progress</th>
                                )}
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            key={activeTab}
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-white/5"
                        >
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user: UserData) => (
                                    <motion.tr
                                        variants={item}
                                        key={user.id}
                                        className="group hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-teal-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:pointer-events-none"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4 relative z-10">
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    className={`w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center font-black text-lg shadow-2xl ${activeTab === 'active'
                                                        ? 'bg-gradient-to-br from-slate-800 to-slate-950 text-teal-400'
                                                        : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-500'
                                                        }`}
                                                >
                                                    {user.full_name?.charAt(0).toUpperCase() || "?"}
                                                </motion.div>
                                                <div>
                                                    <p className={`text-[15px] font-black transition-colors uppercase italic tracking-tight ${activeTab === 'active' ? 'text-slate-100 group-hover:text-teal-400' : 'text-slate-400'
                                                        }`}>
                                                        {user.full_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">{user.employee_id}</p>
                                                    {!user.has_password && (
                                                        <div className="mt-2 w-fit px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
                                                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic animate-pulse">Inactive Account</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1.5 relative z-10">
                                                {user.email && (
                                                    <div className="flex items-center gap-1.5 group/link">
                                                        <Mail className="w-3.5 h-3.5 text-slate-600 group-hover/link:text-teal-500 transition-colors" />
                                                        <span className="text-xs text-slate-500 font-bold group-hover/link:text-slate-300 transition-colors">{user.email}</span>
                                                    </div>
                                                )}
                                                {user.mobile_number && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                                                        <span className="text-xs text-slate-500 font-bold">{user.mobile_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2 relative z-10">
                                                <div className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.role === 'ADMIN'
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                                    }`}>
                                                    <Shield className="w-3 h-3" />
                                                    {user.role}
                                                </div>
                                                <div className="flex flex-col gap-1 px-3 py-0 relative z-10">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building className="w-3.5 h-3.5 text-slate-600" />
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{user.team?.name || "No Team"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{user.designation?.name || "No Designation"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                                        DEPOT: <span className="text-slate-200">{user.home_location?.name || "N/A"}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3.5 h-3.5 flex items-center justify-center text-emerald-400 font-black text-[10px] border border-emerald-500/30 rounded-sm">S</div>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                                        SITE: <span className="text-slate-200">{user.assigned_location?.name || "Floating"}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {activeTab === 'active' && (
                                            <td className="p-6">
                                                <div className="flex gap-2 relative z-10">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-10 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: `${(user.training_stats?.completed || 0) / (user.training_stats?.total || 1) * 100}%` }} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-emerald-500">{user.training_stats?.completed}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-10 h-1 bg-amber-500/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-500" style={{ width: `${(user.training_stats?.ongoing || 0) / (user.training_stats?.total || 1) * 100}%` }} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-amber-500">{user.training_stats?.ongoing}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-slate-500" style={{ width: `${(user.training_stats?.pending || 0) / (user.training_stats?.total || 1) * 100}%` }} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-500">{user.training_stats?.pending}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-6 text-right relative">
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveActionUserId(activeActionUserId === user.id ? null : user.id);
                                                }}
                                                className={`p-3 rounded-xl transition-all relative z-10 ${activeActionUserId === user.id ? "bg-white/15 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </motion.button>

                                            {/* Action Menu Dropdown */}
                                            <AnimatePresence>
                                                {activeActionUserId === user.id && (
                                                    <motion.div
                                                        ref={actionMenuRef}
                                                        initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                                        className="absolute right-16 top-12 w-56 bg-[#0f172a] border border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="p-2 space-y-1">
                                                            {[
                                                                { label: 'View Profile', icon: User, color: 'indigo', action: () => setDetailsPopupUser(user), show: true },
                                                                { label: 'Training Record', icon: BookOpen, color: 'teal', action: () => setTrainingsPopupUserId({ id: user.id, name: user.full_name }), show: activeTab === 'active' },
                                                                { label: 'Reset Password', icon: Lock, color: 'amber', action: () => handleResetPassword(user.id), show: activeTab === 'active' },
                                                            ]
                                                                .filter(btn => btn.show)
                                                                .map((btn, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left group/btn"
                                                                        onClick={() => {
                                                                            btn.action()
                                                                            setActiveActionUserId(null)
                                                                        }}
                                                                    >
                                                                        <btn.icon className={`w-3.5 h-3.5 text-${btn.color}-500 group-hover/btn:scale-110 transition-transform`} />
                                                                        {btn.label}
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>

                                        {/* Subtle row highlight glow */}

                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Search className="w-12 h-12 text-slate-500" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                                No matching records found.
                                            </p>
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD USER POPUP --- */}
            <AddUserPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                options={options}
            />

            {/* --- USER DETAILS POPUP --- */}
            <UserDetailsPopup
                isOpen={!!detailsPopupUser}
                onClose={() => setDetailsPopupUser(null)}
                user={detailsPopupUser}
            />

            {/* --- TRAINING DETAILS POPUP --- */}
            <UserTrainingsPopup
                isOpen={!!trainingsPopupUserId}
                onClose={() => setTrainingsPopupUserId(null)}
                userId={trainingsPopupUserId?.id || null}
                userName={trainingsPopupUserId?.name || ""}
            />

            {/* --- CSV IMPORT WIZARD --- */}
            <CSVImportWizard
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />

        </div >
    )
}

// Helper Components for Filter UI
function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{title}</h5>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    )
}

function FilterCheckbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? "bg-teal-500 border-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]" : "border-slate-700 group-hover:border-slate-500"}`}>
                {checked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckSquare className="w-3 h-3 text-slate-950" /></motion.div>}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${checked ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                {label}
            </span>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        </label>
    )
}
