export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/admin-dashboard/sidebar";
import { Header } from "@/components/admin-dashboard/header";
import { UsersTable } from "@/components/admin-dashboard/users/users-table";
import { getUsers } from "@/app/actions/getUsers";
import { getUserFormOptions } from "@/app/actions/user-management";
import { SectionHeader } from "@/components/admin-dashboard/section-header";
import { DynamicBackground } from "@/components/admin-dashboard/dynamic-background";

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Parallel Data Fetching for Speed
    const [activeUsersRes, pendingUsersRes, optionsRes] = await Promise.all([
        getUsers('active'),
        getUsers('pending'),
        getUserFormOptions()
    ])

    const params = await searchParams;
    const initialTab = typeof params.tab === 'string' && params.tab === 'pending' ? 'pending' : 'active'

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-teal-500/30 selection:text-teal-200">
            <DynamicBackground />

            <Sidebar />

            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-10 max-w-[1600px] mx-auto relative z-10">
                    <Header />
                    <SectionHeader
                        title="User Management"
                        description="Manage workforce access and verify user credentials."
                        icon="users"
                        accentColor="teal"
                    />

                    {/* DEBUG INFO REMOVED */}

                    <UsersTable
                        activeUsers={activeUsersRes.data || []}
                        pendingUsers={pendingUsersRes.data || []}
                        options={optionsRes} // Pass Dropdown Options
                        initialTab={initialTab}
                    />
                </div>
            </main>
        </div>
    );
}