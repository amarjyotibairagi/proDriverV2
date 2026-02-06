"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReportCharts } from "./report-charts"
import { Download, FileBarChart, BarChart, CalendarIcon, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getDrillDownData } from "@/app/actions/reports"
import { DrillDownModal } from "./drill-down-modal"

interface ReportsDashboardProps {
    data: {
        summary: {
            totalWorkforce: number
            activeComponents: number
            averageScore: number
            globalPassRate: number
        }
        trainingStats: { status: string, count: number }[]
        testStats: { status: string, count: number }[]
        modulePerformance: { name: string, averageScore: number, attempts: number }[]
        depotStats: { name: string, completed: number, total: number, percentage: number }[]
        teamStats: { name: string, completed: number, total: number, percentage: number }[]
    }
    filters?: {
        depots: { id: string, name: string }[]
        departments: { id: string, name: string }[]
    }
    currentFilters?: {
        from?: Date
        to?: Date
        depotId?: string
        departmentId?: string
    }
}

export function ReportsDashboard({ data, filters, currentFilters }: ReportsDashboardProps) {
    const router = useRouter()
    const pathname = usePathname()

    const [date, setDate] = useState<DateRange | undefined>({
        from: currentFilters?.from,
        to: currentFilters?.to
    })

    const createQueryString = (params: Record<string, string | null | undefined>) => {
        const newParams = new URLSearchParams()

        // Add existing params from props
        if (currentFilters?.from) newParams.set('from', currentFilters.from.toISOString())
        if (currentFilters?.to) newParams.set('to', currentFilters.to.toISOString())
        if (currentFilters?.depotId) newParams.set('depotId', currentFilters.depotId)
        if (currentFilters?.departmentId) newParams.set('departmentId', currentFilters.departmentId)

        // Merge new params
        Object.keys(params).forEach(key => {
            const value = params[key]
            if (value === null) {
                newParams.delete(key)
            } else if (value !== undefined) {
                newParams.set(key, value)
            }
        })

        return newParams.toString()
    }

    const handleFilterChange = (key: string, value: string) => {
        const newValue = (value && value !== 'all') ? value : null
        router.push(`${pathname}?${createQueryString({ [key]: newValue })}`)
    }

    const handleDateSelect = (range: DateRange | undefined) => {
        setDate(range)
        if (range?.from) {
            router.push(`${pathname}?${createQueryString({
                from: range.from.toISOString(),
                to: range.to ? range.to.toISOString() : null
            })}`)
        } else {
            // Clear date but keep other filters
            router.push(`${pathname}?${createQueryString({ from: null, to: null })}`)
        }
    }

    const clearDateFilter = () => {
        setDate(undefined)
        router.push(`${pathname}?${createQueryString({ from: null, to: null })}`)
    }
    const [isDrillDownOpen, setIsDrillDownOpen] = useState(false)
    const [drillDownData, setDrillDownData] = useState<any[]>([])
    const [drillDownTitle, setDrillDownTitle] = useState("")
    const [isDrillDownLoading, setIsDrillDownLoading] = useState(false)

    const handleDrillDown = async (category: string, value: string, title: string, moduleId?: string) => {
        setIsDrillDownOpen(true)
        setDrillDownTitle(title)
        setIsDrillDownLoading(true)
        setDrillDownData([])

        const dateRange = date ? {
            from: date.from ? date.from.toISOString() : undefined,
            to: date.to ? date.to.toISOString() : undefined
        } : undefined

        const result = await getDrillDownData({
            category: category as any,
            value,
            moduleId,
            dateRange
        })

        if (result.success) {
            setDrillDownData(result.data || [])
        } else {
            alert("Failed to fetch details")
        }
        setIsDrillDownLoading(false)
    }



    const handleExport = async () => {
        try {
            const { toPng } = await import('html-to-image')
            const jsPDF = (await import('jspdf')).default

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: 'a4'
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 20
            let currentY = margin

            const addToPdf = async (elementId: string | Element, isElement = false) => {
                const element = isElement ? elementId as HTMLElement : document.getElementById(elementId as string)
                if (!element) return

                const dataUrl = await toPng(element, {
                    backgroundColor: '#020617',
                    cacheBust: true,
                    pixelRatio: 2 // Higher quality
                })

                const imgProps = pdf.getImageProperties(dataUrl)
                const pdfImgHeight = (imgProps.height * (pageWidth - (margin * 2))) / imgProps.width

                // Check for page break
                if (currentY + pdfImgHeight > pageHeight - margin) {
                    pdf.addPage()
                    currentY = margin
                }

                pdf.addImage(dataUrl, 'PNG', margin, currentY, pageWidth - (margin * 2), pdfImgHeight)
                currentY += pdfImgHeight + 20 // Add gap
            }

            // 1. Header
            await addToPdf('report-header')

            // 2. Summary Cards
            await addToPdf('report-summary')

            // 3. Charts (Iterate individually)
            const charts = document.getElementsByClassName('report-chart-container')
            for (let i = 0; i < charts.length; i++) {
                await addToPdf(charts[i], true)
            }

            pdf.save(`training-report-${new Date().toISOString().split('T')[0]}.pdf`)

        } catch (error) {
            console.error("Export failed:", error)
            alert("Failed to generate PDF report. Please try again.")
        }
    }

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div id="report-header" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5 relative bg-[#020617]">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                            <BarChart className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] italic">Training <span className="text-indigo-500">Analytics</span></h2>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Fleet Performance Reports
                    </h1>
                    <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest leading-relaxed max-w-xl">
                        Comprehensive analytics overview of workforce training progress and performance metrics.
                    </p>
                </div>



                <div className="flex items-center gap-4 relative z-10">
                    {/* Date Filter */}
                    <div className={cn("grid gap-2", "backdrop-blur-xl")}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal bg-slate-900/50 border-white/10 hover:bg-slate-800/50 text-slate-200",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-400" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Filter by Date Range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0f172a] border-white/10" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    numberOfMonths={2}
                                    className="bg-[#0f172a] text-slate-200"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {date?.from && (
                        <Button variant="ghost" size="icon" onClick={clearDateFilter} className="text-slate-400 hover:text-white hover:bg-white/10">
                            <X className="w-4 h-4" />
                        </Button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="flex items-center gap-3 px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-[1.5rem] text-xs font-black transition-all shadow-2xl shadow-indigo-500/20 border border-white/5 uppercase italic tracking-widest relative overflow-hidden group"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download Report (PDF)</span>
                    </motion.button>

                </div>
            </div>

            {/* Entity Filters */}
            <div className="flex flex-wrap gap-4 relative z-10 pb-4 border-b border-white/5">
                <select
                    className="bg-slate-900/50 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50"
                    value={currentFilters?.depotId || 'all'}
                    onChange={(e) => handleFilterChange('depotId', e.target.value)}
                >
                    <option value="all">All Depots</option>
                    {filters?.depots.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                <select
                    className="bg-slate-900/50 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50"
                    value={currentFilters?.departmentId || 'all'}
                    onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                >
                    <option value="all">All Departments</option>
                    {filters?.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div id="reports-dashboard-content" className="space-y-8 p-4"> {/* ID for PDF capture */}

                {/* KPI Cards */}
                {data?.summary && (
                    <div id="report-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#020617]">
                        {/* Total Workforce */}
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">Total Workforce</h3>
                            <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                <span className="text-4xl font-black text-white italic tracking-tighter">{data.summary.totalWorkforce}</span>
                                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{data.summary.activeComponents} Active</span>
                            </div>
                        </div>

                        {/* Completion Rate (Derived) */}
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">Avg Test Score</h3>
                            <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                <span className="text-4xl font-black text-white italic tracking-tighter">{data.summary.averageScore}%</span>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Global Average</span>
                            </div>
                        </div>

                        {/* Global Pass Rate */}
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">Pass Rate</h3>
                            <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                <span className="text-4xl font-black text-white italic tracking-tighter">{data.summary.globalPassRate}%</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">First Attempt</span>
                            </div>
                        </div>

                        {/* Active Modules (Estimate) */}
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">Module Efficiency</h3>
                            <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                <span className="text-4xl font-black text-white italic tracking-tighter">
                                    {data.modulePerformance.length > 0
                                        ? Math.max(...data.modulePerformance.map(m => m.averageScore)) + '%'
                                        : 'N/A'
                                    }
                                </span>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Top Module Score</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <AnimatePresence mode="wait">
                    {data ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <ReportCharts
                                trainingStats={data.trainingStats}
                                testStats={data.testStats}
                                modulePerformance={data.modulePerformance}
                                depotStats={data.depotStats}
                                teamStats={data.teamStats}
                                onChartClick={handleDrillDown}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-40 glass-card rounded-[3rem] border border-white/5 bg-slate-900/40"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                <FileBarChart className="w-10 h-10 text-slate-600 opacity-20" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">No Analytics Data Available</p>
                            <p className="text-[10px] opacity-30 mt-2 uppercase font-bold tracking-widest text-slate-600">Please refine your report parameters</p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div> {/* End of PDF capture area */}

            <DrillDownModal
                isOpen={isDrillDownOpen}
                onClose={() => setIsDrillDownOpen(false)}
                title={drillDownTitle}
                data={drillDownData}
                loading={isDrillDownLoading}
            />

        </div>
    )
}



