export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/admin-dashboard/sidebar";
import { Header } from "@/components/admin-dashboard/header";
import { getMasterData } from "@/app/actions/master-data";
import { MasterDataManager } from "@/components/admin-dashboard/master-data/master-data-manager";
import { SectionHeader } from "@/components/admin-dashboard/section-header";
import { DynamicBackground } from "@/components/admin-dashboard/dynamic-background";

export default async function MasterDataPage() {
    const { teams, designations, locations } = await getMasterData();

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-teal-500/30 selection:text-teal-200">
            <DynamicBackground />

            <Sidebar />

            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-10 max-w-[1600px] mx-auto relative z-10">
                    <Header />

                    <SectionHeader
                        title="Master Data"
                        description="Configure system-wide structural designations, hub locations, and operational site details."
                        icon="database"
                        accentColor="teal"
                    />

                    <MasterDataManager
                        teams={teams}
                        designations={designations}
                        locations={locations}
                    />
                </div>
            </main>
        </div>
    );
}
