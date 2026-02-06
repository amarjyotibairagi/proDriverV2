import { getModule } from "@/app/actions/module-editor";
import { ModulePlayer } from "@/components/user-dashboard/module-player";
import { notFound } from "next/navigation";

// Define params params as Promise
interface PageProps {
    params: Promise<{ moduleId: string }>;
    searchParams: Promise<{ mode?: string; lang?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PlayModulePage({ params, searchParams }: PageProps) {
    // Await the promises
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const moduleId = parseInt(resolvedParams.moduleId);
    const mode = resolvedSearchParams.mode === 'test' ? 'test' : 'training';
    const lang = resolvedSearchParams.lang || 'en';

    if (isNaN(moduleId)) return notFound();

    const { success, data } = await getModule(moduleId);

    if (!success || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <p>Module not found.</p>
            </div>
        );
    }

    // Determine slides based on mode
    const slides = mode === 'test'
        ? (data.content as any)?.assessment?.slides || []
        : (data.content as any)?.training?.slides || [];

    const translations = (data.content as any)?.translations || {};

    console.log(`[PlayPage] ModuleId: ${moduleId}, Mode: ${mode}, Lang Param: ${lang}`);
    console.log(`[PlayPage] Translations Found For: ${Object.keys(translations).join(', ')}`);
    if (translations[lang]) {
        console.log(`[PlayPage] Sample Translation for ${lang}:`, JSON.stringify(translations[lang]).substring(0, 100));
    } else {
        console.log(`[PlayPage] NO translations found for ${lang}`);
    }

    return (
        <ModulePlayer
            moduleId={moduleId}
            slides={slides}
            mode={mode}
            moduleTitle={data.title}
            translations={translations}
            initialLang={lang}
            totalMarks={data.total_marks}
        />
    );
}
