export const dynamic = 'force-dynamic';
import { Sidebar } from "@/components/admin-dashboard/sidebar";
import { Header } from "@/components/admin-dashboard/header";
import { KPICards } from "@/components/admin-dashboard/kpi-cards";
import { IncidentsChart } from "@/components/admin-dashboard/incidents-chart";
import { RiskRadar } from "@/components/admin-dashboard/risk-radar";
import { TrainingChart } from "@/components/admin-dashboard/training-chart";
import { RecentActivity } from "@/components/admin-dashboard/recent-activity";
import { getAdminStats } from "@/app/actions/getAdminStats";
import { DynamicBackground } from "@/components/admin-dashboard/dynamic-background";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const params = await searchParams;
  const companyFilter = (params.company as 'MOWASALAT' | 'CONTRACTORS' | 'ALL') || 'MOWASALAT';
  const stats = await getAdminStats(companyFilter);

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-teal-500/30 selection:text-teal-200">

      {/* Premium Dynamic Background */}
      <DynamicBackground />

      <Sidebar />

      <main className="lg:ml-64 min-h-screen relative">
        <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-10 max-w-[1600px] mx-auto">

          <Header showFilter={true} />

          {/* 1. KPI Cards */}
          <section className="mb-10">
            <KPICards stats={stats.kpi} />
          </section>

          {/* 2. Charts Row */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2">
              <IncidentsChart data={stats.charts.monthlyTrends} />
            </div>
            <div className="xl:col-span-1">
              <RiskRadar data={stats.charts.riskRadar} />
            </div>
          </section>

          {/* 3. Bottom Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrainingChart data={stats.charts.trainingStatus} />
            <RecentActivity logs={stats.activity} />
          </section>

        </div>


      </main>
    </div>
  );
}