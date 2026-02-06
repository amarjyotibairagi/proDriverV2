"use client"

import { User, CheckCircle2, UserCircle } from "lucide-react"
import { motion } from "framer-motion"

interface UserSelectionTableProps {
    users: any[]
    selectedUserIds: string[]
    onToggleUser: (id: string) => void
    onToggleAll: () => void
}

export function UserSelectionTable({ users, selectedUserIds, onToggleUser, onToggleAll }: UserSelectionTableProps) {
    const isAllSelected = users.length > 0 && users.every(u => selectedUserIds.includes(u.id))
    const isSomeSelected = !isAllSelected && users.some(u => selectedUserIds.includes(u.id))

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
        hidden: { opacity: 0, scale: 0.98 },
        show: { opacity: 1, scale: 1 }
    }

    if (users.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-24 text-slate-500 bg-[#0f172a]/95 glass-card rounded-[3rem] border border-white/10"
            >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <UserCircle className="w-10 h-10 opacity-10" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">No Users Found</p>
                <p className="text-[10px] opacity-30 mt-3 uppercase font-bold tracking-widest text-slate-500">Please adjust your filters</p>
            </motion.div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-[3rem] border border-white/10 glass-card shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-[#0f172a]/95 backdrop-blur-2xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-900/50 border-b border-white/10 text-left">
                        <th className="px-6 py-4 w-16">
                            <button
                                onClick={onToggleAll}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isAllSelected
                                    ? "bg-teal-500 border-teal-500"
                                    : "border-white/20 hover:border-teal-500/50"
                                    }`}
                            >
                                {isAllSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                                {isSomeSelected && !isAllSelected && <div className="w-3 h-0.5 bg-teal-500 rounded-full" />}
                            </button>
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((user) => {
                        const isSelected = selectedUserIds.includes(user.id)
                        return (
                            <motion.tr
                                key={user.id}
                                onClick={() => onToggleUser(user.id)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                className={`cursor-pointer transition-colors ${isSelected ? "bg-teal-500/5" : ""}`}
                            >
                                <td className="px-6 py-4">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                        ? "bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                                        : "border-white/20"
                                        }`}>
                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${isSelected
                                            ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                                            : "bg-slate-900 border-white/10 text-slate-500"
                                            }`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold truncate ${isSelected ? "text-teal-400" : "text-slate-200"}`}>
                                                {user.full_name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">{user.employee_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-400 font-medium">
                                        {user.department?.name || 'General Fleet'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-300 font-medium">
                                            {user.home_location?.name || 'Main Depot'}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {user.assigned_location?.name || 'Roaming'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSelected ? "bg-teal-500/20 text-teal-400" : "bg-white/5 text-slate-500"
                                        }`}>
                                        {isSelected ? "Selected" : "Available"}
                                    </div>
                                </td>
                            </motion.tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
