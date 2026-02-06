"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"
import { Users, MapPin, Building2, TrendingUp, PieChart } from "lucide-react"

interface ModuleStatsProps {
    analytics: any
}

const COLORS = [
    '#2dd4bf', // Teal
    '#818cf8', // Indigo
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#34d399', // Emerald
    '#60a5fa', // Blue
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-3 border border-white/10 shadow-2xl backdrop-blur-md"
            >
                <p className="text-[10px] font-black text-slate-100 mb-1 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        style={{ backgroundColor: payload[0].fill }}
                    />
                    <p className="text-[14px] font-black text-amber-400 italic">
                        {payload[0].value} <span className="text-[10px] text-slate-500 uppercase font-black not-italic ml-1">Drivers</span>
                    </p>
                </div>
            </motion.div>
        );
    }
    return null;
};

const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;

    return (
        <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x={x + width + 10}
            y={y + 11}
            fill="#fbbf24" // Gold color
            fontSize={10}
            fontWeight="900"
            textAnchor="start"
            className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] italic"
        >
            {value}
        </motion.text>
    );
};

const CustomChart = ({ title, data, icon: Icon, color, delay = 0 }: any) => {
    if (!data || data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem] text-center"
            >
                <Icon className="w-8 h-8 text-slate-800 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">No {title} Data</p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="p-7 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] transition-all group relative overflow-hidden"
        >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-${color}-500/10 transition-all duration-700`} />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-2.5 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 shadow-inner`}
                    >
                        <Icon className={`w-4 h-4 text-${color}-400`} />
                    </motion.div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title} Allocation</h4>
                        <p className="text-[9px] text-slate-600 font-bold mt-0.5 uppercase">Deployment Type</p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <TrendingUp className="w-4 h-4 text-slate-800 group-hover:text-slate-500 transition-colors" />
                </motion.div>
            </div>

            <div className="h-[200px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: -10, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={90}
                            fontSize={10}
                            tick={{ fill: '#94a3b8', fontWeight: '900', letterSpacing: '0.05em' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 6, 6, 0]}
                            barSize={14}
                            filter="url(#glow)"
                            animationDuration={1500}
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="value" content={<CustomBarLabel />} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export function ModuleStats({ analytics }: ModuleStatsProps) {
    if (!analytics) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center mb-8"
                >
                    <PieChart className="w-10 h-10 text-slate-700" />
                </motion.div>
                <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] leading-loose max-w-[200px] mx-auto opacity-50">
                    Propel a module to reveal deep segment architecture
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* SVG Defs for Glow Filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    <CustomChart key="team" title="Team" data={analytics.teams} icon={Building2} color="teal" delay={0.1} />
                    <CustomChart key="depot" title="Depot" data={analytics.depots} icon={MapPin} color="amber" delay={0.2} />
                    <CustomChart key="sites" title="Assigned Site" data={analytics.locations} icon={Users} color="blue" delay={0.3} />
                </AnimatePresence>
            </div>

            {/* Total Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-8 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/10 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden group"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/5 blur-[50px] rounded-full pointer-events-none"
                />

                <div className="relative z-10">
                    <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.4em] mb-2">Aggregate Teams</p>
                    <div className="flex items-baseline gap-2">
                        <motion.p
                            key={analytics.total}
                            initial={{ scale: 1.2, color: '#2dd4bf' }}
                            animate={{ scale: 1, color: '#fff' }}
                            className="text-5xl font-black text-white tracking-tighter italic"
                        >
                            {analytics.total}
                        </motion.p>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Global Users</p>
                    </div>
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    className="relative z-10 w-16 h-16 rounded-[1.5rem] bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                >
                    <TrendingUp className="w-8 h-8 text-teal-300 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                </motion.div>
            </motion.div>
        </div>
    )
}
