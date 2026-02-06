"use client"

import { motion } from "framer-motion"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import { Activity, PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react"

const COLORS = {
    // Training Status
    NOT_STARTED: '#64748b', // Slate-500
    ONGOING: '#f59e0b',     // Amber-500
    COMPLETED: '#10b981',   // Emerald-500

    // Test Status
    PASSED: '#10b981',      // Emerald-500
    FAILED: '#ef4444',      // Red-500
}

const BAR_COLORS = [
    '#5eead4', // Teal-300
    '#818cf8', // Indigo-400
    '#f472b6', // Pink-400
    '#fbbf24', // Amber-400
    '#2dd4bf', // Teal-500
    '#6366f1', // Indigo-500
]

interface ReportChartsProps {
    trainingStats: { status: string, count: number }[]
    testStats: { status: string, count: number }[]
    modulePerformance: { name: string, averageScore: number, attempts: number }[]
    depotStats: { name: string, completed: number, total: number, percentage: number }[]
    teamStats: { name: string, completed: number, total: number, percentage: number }[]
    onChartClick?: (category: string, value: string, title: string, moduleId?: string) => void
}

const CustomBarLabel = (props: any) => {
    const { x, y, width, value, dataKey } = props;
    if (value === undefined || value === null) return null;

    const displayValue = dataKey === 'percentage' ? `${value}%` : value;

    return (
        <text
            x={x + width / 2}
            y={y - 12}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize={9}
            fontWeight="700"
            className="uppercase tracking-widest"
        >
            {displayValue}
        </text>
    );
};

const CustomBarCategoryLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value) return null;

    return (
        <g transform={`translate(${x + width / 2}, ${y + height - 15})`}>
            <text
                x={0}
                y={0}
                fill="rgba(0,0,0,0.7)"
                textAnchor="start"
                fontSize={9}
                fontWeight="800"
                transform="rotate(-90)"
                className="uppercase tracking-widest pointer-events-none"
            >
                {value}
            </text>
        </g>
    );
};

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md"
            >
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest border-b border-white/5 pb-2">{label}</p>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Primary Value</span>
                        </div>
                        <span className="text-xs font-black text-teal-400 italic">{payload[0].value}{unit}</span>
                    </div>

                    {data.attempts !== undefined && (
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Attempts</span>
                            <span className="text-xs font-black text-white italic">{data.attempts}</span>
                        </div>
                    )}

                    {data.completed !== undefined && (
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Completed</span>
                            <span className="text-xs font-black text-emerald-400 italic">{data.completed}</span>
                        </div>
                    )}

                    {data.total !== undefined && (
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Users</span>
                            <span className="text-xs font-black text-slate-300 italic">{data.total}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, fill } = props;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
        <text
            x={x}
            y={y}
            fill={fill}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={9}
            fontWeight="700"
            className="uppercase tracking-widest"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function ReportCharts({ trainingStats, testStats, modulePerformance, depotStats, teamStats, onChartClick }: ReportChartsProps) {

    const trainingData = trainingStats.map(s => ({
        name: s.status.replace('_', ' '),
        value: s.count,
        color: COLORS[s.status as keyof typeof COLORS] || '#cbd5e1'
    }))

    const testData = testStats.map(s => ({
        name: s.status,
        value: s.count,
        color: COLORS[s.status as keyof typeof COLORS] || '#cbd5e1'
    }))

    const containerStyle = (color: string) => `report-chart-container glass-card p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl group relative overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-${color}-500/20`

    return (
        <div className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Training Status Pie */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={containerStyle('teal')}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                                <PieIcon className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Training Progress</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status Allocation</p>
                            </div>
                        </div>
                        <Activity className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trainingData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                    animationDuration={2000}
                                >
                                    {trainingData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke="none"
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => onChartClick?.('training_status', entry.name.replace(' ', '_'), `Training Status: ${entry.name}`)}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    content={({ payload }) => (
                                        <div className="flex justify-center gap-6 mt-4">
                                            {payload?.map((entry: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Test Results Pie */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={containerStyle('amber')}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Test Results</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pass / Fail Ratio</p>
                            </div>
                        </div>
                        <Activity className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={testData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                    animationDuration={2000}
                                >
                                    {testData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke="none"
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => onChartClick?.('test_status', entry.name, `Test Results: ${entry.name}`)}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    content={({ payload }) => (
                                        <div className="flex justify-center gap-6 mt-4">
                                            {payload?.map((entry: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Combined Bar Charts */}
                {[
                    { title: 'Depot-wise Completion', data: depotStats, key: 'percentage' as const, icon: BarChart3, color: 'indigo' },
                    { title: 'Designation Performance', data: teamStats, key: 'percentage' as const, icon: BarChart3, color: 'emerald' },
                    { title: 'Module Efficiency', data: modulePerformance, key: 'averageScore' as const, icon: BarChart3, color: 'pink', unit: '%' }
                ].map((chart, idx) => {
                    const filteredData = chart.data.filter(item => ((item as any)[chart.key] || 0) > 0);
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${containerStyle(chart.color)} lg:col-span-2`}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl bg-${chart.color}-500/10 border border-${chart.color}-500/20`}>
                                        <chart.icon className={`w-5 h-5 text-${chart.color}-400`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em]">{chart.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Performance Overview</p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filteredData} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#475569"
                                            fontSize={9}
                                            fontWeight="700"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={false}
                                            dy={10}
                                            interval={0}
                                        />
                                        <YAxis
                                            stroke="#475569"
                                            fontSize={9}
                                            fontWeight="700"
                                            tickLine={false}
                                            axisLine={false}
                                            unit={chart.unit}
                                            tick={{ fill: '#64748b' }}
                                            domain={chart.unit === '%' ? [0, 100] : [0, 'auto']}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            content={<CustomTooltip unit={chart.unit} />}
                                        />
                                        <Bar
                                            dataKey={chart.key}
                                            radius={[12, 12, 0, 0]}
                                            maxBarSize={50}
                                            animationDuration={2000}
                                        >
                                            {chart.data.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} stroke="none" />
                                            ))}
                                            <LabelList dataKey="name" content={<CustomBarCategoryLabel />} />
                                            <LabelList dataKey={chart.key} content={<CustomBarLabel />} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    );
}
