import { getDriverTrainings } from "@/app/actions/getDriverTrainings";
// Adjust imports to match your specific file tree locations
import { Header } from "@/components/user-dashboard/header";
import { HeroTitle } from "@/components/user-dashboard/dashboard/hero-title";
import { MainContent } from "@/components/user-dashboard/main-content";
import { FooterAction } from "@/components/user-dashboard/dashboard/footer-action";

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { LANGUAGES } from "@/lib/languages";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  // 1. Validate Session
  const session = await getSession();
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const lang = resolvedSearchParams.lang || cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr';

  if (!session || !session.userId) {
    redirect("/login");
  }

  // 2. Fetch User Data from Session ID
  const user = await prisma.user.findUnique({
    where: { employee_id: session.userId }
  });

  if (!user) {
    redirect("/login");
  }

  const { data: trainings } = await getDriverTrainings(user.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_50%_30%,_#0d3d38_0%,_#0a2926_30%,_#051a18_60%,_#020d0c_100%)] text-white" dir={dir}>

      {/* Header - Edge to Edge */}
      <Header
        user={{
          name: user.full_name,
          id: user.employee_id,
          dbId: user.id
        }}
        currentLang={lang}
      />

      {/* Main Content Area - Inset/Floating */}
      <main className="px-3 sm:px-8 lg:px-16 xl:px-24 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

          {/* Hero Title Section */}
          <HeroTitle lang={lang} />

          {/* Main Glass Card */}
          {/* We pass the DB data here. MainContent handles the "Pending/Completed" tabs internally. */}
          <MainContent trainings={trainings || []} lang={lang} />

          {/* Footer Action Button */}
          <FooterAction />

        </div>
      </main>
    </div>
  )
}