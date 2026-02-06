"use client"

import { useState } from "react"
import { Briefcase, MapPin, Users, Plus, LayoutGrid, Database } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MasterDataTable } from "./master-data-table"
import { ManageItemPopup } from "./manage-item-popup"
import {
    manageTeam, deleteTeam,
    manageDesignation, deleteDesignation,
    manageLocation, deleteLocation
} from "@/app/actions/master-data"

interface MasterDataManagerProps {
    teams: any[]
    designations: any[]
    locations: any[]
}

type TabType = 'TEAMS' | 'DESIGNATIONS' | 'DEPOTS' | 'ASSIGNED_AREAS'

export function MasterDataManager({ teams, designations, locations }: MasterDataManagerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('TEAMS')
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)

    const handleOpenAdd = () => {
        setEditingItem(null)
        setIsPopupOpen(true)
    }

    const handleOpenEdit = (item: any) => {
        setEditingItem(item)
        setIsPopupOpen(true)
    }

    const getActiveConfig = () => {
        switch (activeTab) {
            case 'TEAMS':
                return {
                    data: teams,
                    type: 'TEAM' as const,
                    fixedLocationType: undefined,
                    actions: { save: manageTeam, delete: deleteTeam },
                    title: "Operational Teams",
                    desc: "Manage high-level organizational units and driver team definitions.",
                    accent: "teal"
                }
            case 'DESIGNATIONS':
                return {
                    data: designations,
                    type: 'DESIGNATION' as const,
                    fixedLocationType: undefined,
                    actions: { save: manageDesignation, delete: deleteDesignation },
                    title: "Staff Designations",
                    desc: "Define official roles and professional titles for the workforce.",
                    accent: "emerald"
                }
            case 'DEPOTS':
                return {
                    data: locations.filter(l => l.type === 'HOME' || !l.type),
                    type: 'LOCATION' as const,
                    fixedLocationType: 'HOME' as const,
                    actions: { save: manageLocation, delete: deleteLocation },
                    title: "Central Depot Repository",
                    desc: "Configure primary home base coordinates for the fleet.",
                    accent: "indigo"
                }
            case 'ASSIGNED_AREAS':
                return {
                    data: locations.filter(l => l.type === 'ASSIGNED'),
                    type: 'LOCATION' as const,
                    fixedLocationType: 'ASSIGNED' as const,
                    actions: { save: manageLocation, delete: deleteLocation },
                    title: "Operational Work-Sites",
                    desc: "Define specific dispatch areas and active operations zones.",
                    accent: "emerald"
                }
        }
    }

    const config = getActiveConfig()

    return (
        <div className="space-y-8">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5 relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl bg-${config.accent}-500/10 border border-${config.accent}-500/20 shadow-lg shadow-${config.accent}-500/5`}>
                            <Database className={`w-4 h-4 text-${config.accent}-400`} />
                        </div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] italic">System Core <span className={`text-${config.accent}-500`}>Architecture</span></h2>
                    </div>
                    <motion.h1
                        key={config.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black text-white uppercase italic tracking-tighter"
                    >
                        {config.title}
                    </motion.h1>
                    <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest leading-relaxed max-w-xl">{config.desc}</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenAdd}
                    className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 rounded-[1.5rem] text-xs font-black transition-all shadow-2xl shadow-teal-500/20 uppercase italic tracking-widest relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Add Item</span>
                </motion.button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-slate-900/50 border border-white/5 rounded-[2rem] w-fit relative overflow-hidden shadow-inner">
                <AnimatePresence mode="popLayout">
                    <TabButton
                        key="TEAMS"
                        active={activeTab === 'TEAMS'}
                        onClick={() => setActiveTab('TEAMS')}
                        icon={Users}
                        label="Teams"
                        activeColor="teal"
                    />
                    <TabButton
                        key="DESIGNATIONS"
                        active={activeTab === 'DESIGNATIONS'}
                        onClick={() => setActiveTab('DESIGNATIONS')}
                        icon={Briefcase}
                        label="Designations"
                        activeColor="emerald"
                    />
                    <TabButton
                        key="DEPOTS"
                        active={activeTab === 'DEPOTS'}
                        onClick={() => setActiveTab('DEPOTS')}
                        icon={MapPin}
                        label="Depots"
                        activeColor="indigo"
                    />
                    <TabButton
                        key="ASSIGNED_AREAS"
                        active={activeTab === 'ASSIGNED_AREAS'}
                        onClick={() => setActiveTab('ASSIGNED_AREAS')}
                        icon={LayoutGrid}
                        label="Work-Zones"
                        activeColor="emerald"
                    />
                </AnimatePresence>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                >
                    <MasterDataTable
                        data={config.data}
                        type={config.type}
                        onEdit={handleOpenEdit}
                        onDelete={config.actions.delete}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Popup */}
            <ManageItemPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                item={editingItem}
                type={config.type}
                fixedLocationType={config.fixedLocationType}
                onSave={config.actions.save}
            />
        </div>
    )
}

function TabButton({ active, onClick, icon: Icon, label, activeColor }: any) {
    return (
        <button
            onClick={onClick}
            className={`relative px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 uppercase italic tracking-tighter z-10 ${active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
        >
            {active && (
                <motion.div
                    layoutId="masterTab"
                    className={`absolute inset-0 rounded-2xl shadow-xl ${activeColor === 'indigo' ? 'bg-indigo-500 shadow-indigo-500/20' :
                        activeColor === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' :
                            'bg-teal-500 shadow-teal-500/20'
                        }`}
                    transition={{ type: "spring" as const, bounce: 0.2, duration: 0.6 }}
                />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{label}</span>
        </button>
    )
}
