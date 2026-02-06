"use client"

import { useState } from "react"
import { X, User, Mail, Phone, Lock, Building, MapPin, Briefcase, Target, ShieldCheck } from "lucide-react"
import { createUser } from "@/app/actions/user-management"
import { motion, AnimatePresence } from "framer-motion"

export function AddUserPopup({ isOpen, onClose, options }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        employeeId: "",
        name: "",
        email: "",
        company: "Mowasalat",
        mobile: "",
        role: "BASIC",
        teamId: "",
        designationId: "",
        locationId: "",
        homeLocationId: ""
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createUser(formData)

        if (result.success) {
            alert("Staff Registered: Initial password set to 'Welcome@123'")
            onClose()
            setFormData({
                employeeId: "", name: "", email: "", mobile: "",
                company: "Mowasalat",
                role: "BASIC", teamId: "", designationId: "", locationId: "", homeLocationId: ""
            })
        } else {
            alert("Registration Error: " + result.error)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-10 pb-6 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                            <Target className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-100 uppercase italic tracking-widest leading-none">
                                Register <span className="text-teal-400">Staff</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">System: Registration Form</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-8 relative z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputGroup label="Staff ID" icon={Briefcase} value={formData.employeeId} onChange={(e: any) => setFormData({ ...formData, employeeId: e.target.value })} required />
                        <InputGroup label="Full Name" icon={User} value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} required />
                        <InputGroup label="Email Address" icon={Mail} type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} required />
                        <InputGroup label="Command Company" icon={Building} value={formData.company} onChange={(e: any) => setFormData({ ...formData, company: e.target.value })} required />
                        <InputGroup label="Mobile Number" icon={Phone} value={formData.mobile} onChange={(e: any) => setFormData({ ...formData, mobile: e.target.value })} required />

                        {/* Role Select */}
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 mb-2.5 uppercase tracking-widest ml-1 group-focus-within:text-teal-400 transition-colors">Access Level</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-teal-500" />
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[14px] font-black uppercase italic tracking-tight text-slate-200 outline-none focus:border-teal-500/50 appearance-none shadow-inner transition-all"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="BASIC" className="bg-slate-900 text-white">Driver Status (Basic)</option>
                                    <option value="ADMIN" className="bg-slate-900 text-white">Commander Status (Admin)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">▼</div>
                            </div>
                        </div>

                        {/* Team Select */}
                        <SelectGroup
                            label="Team"
                            icon={Building}
                            value={formData.teamId}
                            onChange={(e: any) => setFormData({ ...formData, teamId: e.target.value })}
                            options={options.teams}
                        />

                        {/* Designation Select */}
                        <SelectGroup
                            label="Designation"
                            icon={Briefcase}
                            value={formData.designationId}
                            onChange={(e: any) => setFormData({ ...formData, designationId: e.target.value })}
                            options={options.designations}
                        />

                        {/* Assigned Location */}
                        <SelectGroup
                            label="Assigned Location"
                            icon={MapPin}
                            value={formData.locationId}
                            onChange={(e: any) => setFormData({ ...formData, locationId: e.target.value })}
                            options={options.locations}
                        />

                        {/* Home Location */}
                        <SelectGroup
                            label="Home Location"
                            icon={MapPin}
                            value={formData.homeLocationId}
                            onChange={(e: any) => setFormData({ ...formData, homeLocationId: e.target.value })}
                            options={options.locations}
                        />

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end items-center gap-6 pt-10 border-t border-white/5">
                        <button type="button" onClick={onClose} className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors italic">Cancel</button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="px-10 py-5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-3xl text-[12px] font-black transition-all shadow-2xl shadow-teal-500/30 disabled:opacity-50 uppercase italic tracking-widest flex items-center gap-3"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />}
                            {loading ? "REGISTERING..." : "REGISTER STAFF"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>
        </div>
    )
}

function InputGroup({ label, icon: Icon, type = "text", value, onChange, required }: any) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-500 mb-2.5 uppercase tracking-widest ml-1 group-focus-within:text-teal-400 transition-colors">
                {label} {required && <span className="text-rose-500 font-bold opacity-50">*</span>}
            </label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-teal-500" />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`w-full bg-black/40 border rounded-2xl pl-12 pr-6 py-4 text-[14px] font-black uppercase italic tracking-tight text-slate-200 outline-none transition-all placeholder:text-slate-800 shadow-inner group-focus-within:bg-black/60 ${required ? "border-teal-500/20 focus:border-teal-500/60" : "border-white/5 focus:border-teal-500/50"
                        }`}
                    placeholder={`Define ${label.toLowerCase()}`}
                />
            </div>
        </div>
    )
}

function SelectGroup({ label, icon: Icon, value, onChange, options }: any) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-500 mb-2.5 uppercase tracking-widest ml-1 group-focus-within:text-teal-400 transition-colors">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-teal-500" />
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-8 py-4 text-[14px] font-black uppercase italic tracking-tight text-slate-200 outline-none focus:border-teal-500/50 shadow-inner group-focus-within:bg-black/60 appearance-none cursor-pointer transition-all"
                >
                    <option value="" className="bg-slate-900">Select {label}...</option>
                    {options?.map((opt: any) => (
                        <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">{opt.name || opt.title}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none opacity-40">▼</div>
            </div>
        </div>
    )
}
