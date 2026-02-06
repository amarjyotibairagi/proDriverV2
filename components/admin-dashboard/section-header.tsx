"use client"

import { motion } from "framer-motion"
import { Users, BookOpen, Send, Terminal, BarChart3, Database, LucideIcon, Settings } from "lucide-react"

interface SectionHeaderProps {
    title: string;
    description: string;
    icon: "users" | "book" | "send" | "terminal" | "chart" | "database" | "settings";
    accentColor?: string; // teal, amber, indigo, rose, emerald
}

const iconMap: Record<string, LucideIcon> = {
    users: Users,
    book: BookOpen,
    send: Send,
    terminal: Terminal,
    chart: BarChart3,
    database: Database,
    settings: Settings,
}

const colorMap: Record<string, string> = {
    teal: "text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-teal-500/5",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
}

const textAccentMap: Record<string, string> = {
    teal: "text-teal-500",
    amber: "text-amber-500",
    indigo: "text-indigo-500",
    rose: "text-rose-500",
    emerald: "text-emerald-500",
}

export function SectionHeader({ title, description, icon, accentColor = "teal" }: SectionHeaderProps) {
    const colorClasses = colorMap[accentColor] || colorMap.teal;
    const textAccentClass = textAccentMap[accentColor] || textAccentMap.teal;
    const Icon = iconMap[icon] || Terminal;

    return (
        <div className="mb-8 mt-2 relative group">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl border shadow-lg transition-transform duration-500 group-hover:rotate-6 ${colorClasses}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
                    Administrative <span className={textAccentClass}>Management</span>
                </span>
            </div>

            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                {title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? textAccentClass : ""}>
                        {word}{' '}
                    </span>
                ))}
            </h1>

            <div className="flex items-center gap-4 mt-3">
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-2xl">
                    {description}
                </p>
            </div>

            {/* Subtle glow behind icon */}
            <div className={`absolute -top-4 -left-4 w-12 h-12 blur-2xl opacity-10 rounded-full pointer-events-none ${accentColor === 'teal' ? 'bg-teal-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
        </div>
    )
}
