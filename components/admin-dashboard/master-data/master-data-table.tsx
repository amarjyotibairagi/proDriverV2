"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Edit2, Trash2, MapPin, Users, Briefcase, LayoutGrid, Database } from "lucide-react"

interface MasterDataTableProps {
    data: any[]
    type: 'DEPARTMENT' | 'DESIGNATION' | 'LOCATION'
    onEdit: (item: any) => void
    onDelete: (id: string) => void
}

export function MasterDataTable({ data, type, onEdit, onDelete }: MasterDataTableProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this item? This action cannot be reversed if users are already linked.")) {
            onDelete(id)
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariant = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={`Scan ${type.toLowerCase()} records...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600 uppercase tracking-widest"
                    />
                </div>
                <div className="flex items-center gap-3 px-6 py-3.5 bg-black/20 rounded-2xl border border-white/5 min-w-[150px] justify-center">
                    <Database className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                        <span className="text-slate-200">{filteredData.length}</span> Objects
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                <div className="overflow-x-auto min-w-[800px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-8 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Object Identity</th>
                                {type === 'LOCATION' && (
                                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Type</th>
                                )}
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Linked Users</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right pr-10">Directives</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-white/5"
                        >
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <motion.tr
                                        variants={itemVariant}
                                        key={item.id}
                                        className="group hover:bg-white/[0.04] transition-all relative overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-teal-500/10 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity"
                                    >
                                        <td className="p-8 pl-10">
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center shadow-2xl group-hover:rotate-3 transition-transform">
                                                    {type === 'LOCATION' ? <MapPin className="w-5 h-5 text-indigo-400" /> : <LayoutGrid className="w-5 h-5 text-emerald-400" />}
                                                </div>
                                                <div>
                                                    <div className="text-[15px] font-black text-slate-200 group-hover:text-teal-400 transition-colors uppercase italic tracking-tighter">{item.name}</div>
                                                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">Registry Ref: {item.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>

                                        {type === 'LOCATION' && (
                                            <td className="p-8">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic shadow-lg ${item.type === 'HOME'
                                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5"
                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
                                                    }`}>
                                                    {item.type === 'HOME' ? 'Home Depot' : 'Assigned Site'}
                                                </span>
                                            </td>
                                        )}

                                        <td className="p-8">
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                                    <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-500 transition-colors" />
                                                </div>
                                                <div className="text-[14px] font-black text-slate-400 italic">
                                                    {type === 'LOCATION'
                                                        ? (item._count?.users_home || 0) + (item._count?.users_assigned || 0)
                                                        : (item._count?.users || 0)
                                                    }
                                                    <span className="text-[9px] font-black text-slate-600 uppercase not-italic ml-2 tracking-widest">Active Members</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-8 text-right pr-10">
                                            <div className="flex items-center justify-end gap-3 relative z-10">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(20, 184, 166, 0.1)" }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onEdit(item)}
                                                    className="p-3 text-slate-500 hover:text-teal-400 rounded-xl transition-all border border-transparent hover:border-teal-500/20"
                                                    title="Modify Record"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-3 text-slate-700 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </td>

                                        {/* Row specific accent light - Moved to after: class */}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={type === 'LOCATION' ? 4 : 3} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Search className="w-12 h-12 text-slate-500" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                                                Zero match results in current quadrant.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
