"use client"

import { useState } from "react"
import { X, Check, Calendar, BookOpen, AlertCircle, Clock, Trophy } from "lucide-react"

interface AssignModulePopupProps {
    onClose: () => void
    onAssign: (data: any) => void
    modules: any[]
}

export function AssignModulePopup({ onClose, onAssign, modules }: AssignModulePopupProps) {
    const [selectedModules, setSelectedModules] = useState<string[]>([])
    const [dueDate, setDueDate] = useState('')

    const handleToggleModule = (id: string) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const handleSubmit = () => {
        if (selectedModules.length === 0) return
        onAssign({
            moduleIds: selectedModules,
            dueDate: dueDate ? new Date(dueDate) : undefined
        })
    }

    return (
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0b1120] rounded-3xl border border-teal-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">Finalize Assignment</h2>
                                <p className="text-sm text-slate-400">Select modules to assign to the selected users.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Module Selection Grid */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Available Modules ({modules.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {modules.map(module => {
                                const isSelected = selectedModules.includes(module.id)
                                return (
                                    <div
                                        key={module.id}
                                        onClick={() => handleToggleModule(module.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 group ${isSelected
                                            ? 'bg-teal-500/10 border-teal-500/40'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold transition-colors ${isSelected ? 'text-teal-400' : 'text-slate-200'}`}>
                                                    {module.title}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{module.description || 'No description available'}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-600'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] font-medium">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock className="w-3 h-3 opacity-50" />
                                                {module.duration_minutes}m
                                            </div>
                                            <div className="flex items-center gap-1.5 text-amber-500/80">
                                                <Trophy className="w-3 h-3 opacity-50" />
                                                {module.total_marks} Marks
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Due Date & Final Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Due Date (Optional)
                            </label>

                            {/* Presets */}
                            <div className="flex gap-2">
                                {[7, 14, 30].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => {
                                            const d = new Date()
                                            d.setDate(d.getDate() + days)
                                            setDueDate(d.toISOString().split('T')[0])
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 hover:text-teal-400 text-[10px] font-bold text-slate-400 transition-colors border border-white/5"
                                    >
                                        +{days} Days
                                    </button>
                                ))}
                            </div>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-teal-500/50 [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <div className="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 flex gap-2">
                                <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Confirming this assignment will notify the selected users. Duplicate assignments for the same module will be ignored.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedModules.length === 0}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 disabled:grayscale text-slate-950 rounded-2xl text-sm font-bold shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98]"
                    >
                        Confirm Assignment of {selectedModules.length} Modules
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
