"use client"

import { useState, useEffect } from "react"
import { X, Save, AlertCircle, Database, LayoutGrid, MapPin, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ManageItemPopupProps {
    isOpen: boolean
    onClose: () => void
    item: any | null
    type: 'DEPARTMENT' | 'DESIGNATION' | 'LOCATION'
    fixedLocationType?: 'HOME' | 'ASSIGNED'
    onSave: (data: any) => Promise<{ success: boolean, error?: string }>
}

export function ManageItemPopup({ isOpen, onClose, item, type, fixedLocationType, onSave }: ManageItemPopupProps) {
    const [name, setName] = useState("")
    const [locationType, setLocationType] = useState<'HOME' | 'ASSIGNED'>('HOME')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setError(null)
            if (item) {
                setName(item.name)
                if (type === 'LOCATION') {
                    setLocationType(item.type || fixedLocationType || 'HOME')
                }
            } else {
                setName("")
                setLocationType(fixedLocationType || 'HOME')
            }
        }
    }, [isOpen, item, type, fixedLocationType])

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Identification Label Required.")
            return
        }

        setIsLoading(true)
        setError(null)

        const payload: any = { id: item?.id, name }
        if (type === 'LOCATION') {
            payload.type = locationType
        }

        const result = await onSave(payload)

        if (result.success) {
            onClose()
        } else {
            setError(result.error || "Provisioning synchronization failure.")
        }
        setIsLoading(false)
    }

    if (!isOpen) return null

    const title = item ? `Modify ${type.toLowerCase()}` : `Provision ${type.toLowerCase()}`

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg bg-[#0f172a]/95 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-10 pb-6 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                            <Database className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-100 uppercase italic tracking-widest leading-none">
                                {item ? 'MODIFY' : 'ADD'} <span className="text-teal-400">ITEM</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Master Data Management</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ rotate: 90, backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={onClose}
                        className="p-3 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Body */}
                <div className="p-10 space-y-8 relative z-10">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-[11px] text-rose-400 font-black uppercase tracking-widest italic"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Label Designation</label>
                        <div className="relative group">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-teal-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`Input ${type.toLowerCase()} signature...`}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[15px] font-black text-slate-200 outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-800 uppercase italic tracking-tight shadow-inner"
                                autoFocus
                            />
                        </div>
                    </div>

                    {type === 'LOCATION' && !fixedLocationType && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Spatial Classification</label>
                            <div className="grid grid-cols-2 gap-4">
                                <TabButton
                                    active={locationType === 'HOME'}
                                    onClick={() => setLocationType('HOME')}
                                    label="Central Depot"
                                    icon={MapPin}
                                    activeColor="indigo"
                                />
                                <TabButton
                                    active={locationType === 'ASSIGNED'}
                                    onClick={() => setLocationType('ASSIGNED')}
                                    label="Operational Site"
                                    icon={LayoutGrid}
                                    activeColor="emerald"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-10 bg-black/40 border-t border-white/5 flex justify-end items-center gap-6 relative z-10">
                    <button
                        onClick={onClose}
                        className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors italic"
                    >
                        Abort
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-10 py-5 rounded-[2rem] text-[12px] font-black bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-teal-500/30 uppercase italic tracking-widest"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {item ? 'SAVE CHANGES' : 'CREATE ITEM'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}

function TabButton({ active, onClick, icon: Icon, label, activeColor }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${active
                ? `bg-${activeColor}-500/10 border-${activeColor}-500 text-${activeColor}-400 shadow-[0_0_30px_rgba(0,0,0,0.2)]`
                : "bg-black/20 border-white/5 text-slate-600 hover:border-white/10"
                }`}
        >
            <Icon className={`w-5 h-5 ${active ? `text-${activeColor}-400` : "text-slate-700 opacity-50 group-hover:opacity-100 transition-opacity"}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            {active && (
                <motion.div
                    layoutId="locationTypeActive"
                    className={`absolute inset-0 rounded-2xl border-2 border-${activeColor}-500/30 pointer-events-none`}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    )
}
