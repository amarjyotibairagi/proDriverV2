export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/admin-dashboard/sidebar";
import { Header } from "@/components/admin-dashboard/header";
import { ModuleManager } from "@/components/admin-dashboard/modules/module-manager";
import { SectionHeader } from "@/components/admin-dashboard/section-header";
import { DynamicBackground } from "@/components/admin-dashboard/dynamic-background";

export const metadata = {
    title: "Module Repository | ProDriver",
    description: "Manage and analyze training modules distribution.",
}

export default function ModulesPage() {
    return (
        <div className="min-h-screen bg-[#020617] selection:bg-teal-500/30 selection:text-teal-200">
            <DynamicBackground />

            <Sidebar />

            <main className="lg:ml-64 min-h-screen relative">
                <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-10 max-w-[1600px] mx-auto relative z-10">
                    <Header />

                    <SectionHeader
                        title="Training Modules"
                        description="Manage training content, verify module accuracy, and oversee assignment distribution."
                        icon="book"
                        accentColor="teal"
                    />

                    <ModuleManager />
                </div>
            </main>
        </div>
    );
}
