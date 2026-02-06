export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/admin-dashboard/sidebar";
import { Header } from "@/components/admin-dashboard/header";
import { ReportsDashboard } from "@/components/admin-dashboard/reports/reports-dashboard";
import { getReportStats, getFilterOptions } from "@/app/actions/reports";
import { SectionHeader } from "@/components/admin-dashboard/section-header";
import { DynamicBackground } from "@/components/admin-dashboard/dynamic-background";

import { Suspense } from "react";



export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, depotId?: string, departmentId?: string }> }) {
    const { from, to, depotId, departmentId } = await searchParams
    const [stats, filters] = await Promise.all([
        getReportStats({ from, to }, { depotId, departmentId }),
        getFilterOptions()
    ])

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-teal-500/30 selection:text-teal-200">
            <DynamicBackground />

            <Sidebar />

            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-10 max-w-[1600px] mx-auto relative z-10">
                    <Suspense fallback={<div className="h-20" />}>
                        <Header />
                    </Suspense>

                    <SectionHeader
                        title="Training Reports"
                        description="Analyze fleet-wide performance results, certification status, and knowledge retention metrics."
                        icon="chart"
                        accentColor="teal"
                    />

                    <Suspense fallback={<div className="text-white">Loading filters...</div>}>
                        <ReportsDashboard
                            data={stats}
                            filters={filters}
                            currentFilters={{
                                from: from ? new Date(from) : undefined,
                                to: to ? new Date(to) : undefined,
                                depotId,
                                departmentId
                            }}
                        />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
