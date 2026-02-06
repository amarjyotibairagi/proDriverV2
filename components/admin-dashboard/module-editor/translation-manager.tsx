"use client";

import { useState, useEffect, useRef } from "react";
import { Languages as LangIcon, Loader2, Play, Volume2, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { generateAudioAssets, getAudioConfig, generateModuleTranslations } from "@/app/actions/module-editor";
import { LANGUAGES } from "@/lib/languages";
import { TRANSLATION_INSTRUCTION_SUMMARY } from "@/lib/OpenAI_Prompt";

interface TranslationManagerProps {
    moduleData: any;
    slides: any[]; // Explicitly pass active slides
    activeMode: 'training' | 'assessment'; // New Prop
    onUpdate: (newData: any) => void;
    pathPrefix?: string;
}
export function TranslationManager({ moduleData, slides, activeMode, onUpdate, pathPrefix = "" }: TranslationManagerProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false); // New state for AI Translation
    const [progress, setProgress] = useState("");
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [r2Domain, setR2Domain] = useState<string>("");
    const [isMounted, setIsMounted] = useState(false);
    const abortRef = useRef(false);

    const handleStop = () => {
        abortRef.current = true;
        toast.info("Stopping audio generation...");
    };

    useEffect(() => {
        setIsMounted(true);
        console.log("TranslationManager Mounted. Slides:", slides.length, "ModuleID:", moduleData.id);
        getAudioConfig().then(res => {
            if (res.success && res.r2Domain) {
                setR2Domain(res.r2Domain);
            }
        });
    }, [slides.length, moduleData.id]);

    // ... (Auto-select tab remains)
    useEffect(() => {
        const langs = Object.keys(moduleData.content?.translations || {});
        if (langs.length > 0 && !activeTab) {
            setActiveTab(langs[0]);
        }
    }, [moduleData.content?.translations, activeTab]);

    // ... (extractSlideContent remains)
    const extractSlideContent = (slide: any) => {
        const elements = slide.elements || [];
        if (elements.length === 0) {
            return slide.content || "";
        }

        const pieces: string[] = [];
        elements.forEach((el: any) => {
            if (el.type === 'text' && el.content) {
                pieces.push(el.content);
            } else if (el.type === 'quiz') {
                if (el.content) pieces.push(el.content); // Question
                (el.quizOptions || []).forEach((opt: any) => {
                    if (opt.text) pieces.push(opt.text); // Options
                });
            }
        });
        return pieces.join('\n\n');
    };


    // --- NEW: Generate Translations ---
    const handleGenerateTranslation = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!slides.length) {
            toast.error("No slides to translate");
            return;
        }
        if (!moduleData.id) {
            console.log("No Module ID");
            toast.error("Save the module first!");
            return;
        }

        console.log("Starting translation process...");
        setIsTranslating(true);
        const toastId = toast.loading("Initializing AI Translation (GPT-4o-mini)...");

        try {
            // 1. Construct Export Data
            const exportData = {
                metadata: {
                    id: moduleData.id,
                    title: moduleData.title || 'Untitled Module',
                    slug: moduleData.slug,
                    description: moduleData.description,
                    type: activeMode,
                    exported_at: new Date().toISOString(),
                    instructions: TRANSLATION_INSTRUCTION_SUMMARY,
                    supported_languages: LANGUAGES.map(l => ({ code: l.code, name: l.name, direction: l.dir }))
                },
                slides: slides.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    content: extractSlideContent(s)
                }))
            };

            // 2. Call Server Action
            toast.loading("Sending to OpenAI...", { id: toastId });
            console.log("Calling generateModuleTranslations with:", { id: moduleData.id, title: moduleData.title, mode: activeMode });

            const res = await generateModuleTranslations(
                moduleData.id,
                moduleData.title || 'untitled',
                activeMode,
                exportData
            );
            console.log("Server Action Response:", res);

            if (!res.success || !res.data) {
                throw new Error(res.error || "Translation failed");
            }

            const json = res.data;
            toast.loading("Processing translations...", { id: toastId });

            // 3. Process Response (Merge Logic)
            if (json.translations) {
                const newTranslations = { ...(moduleData.content?.translations || {}) };
                let totalImported = 0;
                let langsFound: string[] = [];

                Object.keys(json.translations).forEach(langCode => {
                    const langData = json.translations[langCode];
                    const slidesData = langData.slides || langData;
                    const code = langCode.trim().toLowerCase();

                    if (!newTranslations[code]) newTranslations[code] = {};

                    if (Array.isArray(slidesData)) {
                        slidesData.forEach((s: any) => {
                            if (s.id) {
                                const existing = newTranslations[code][s.id] || {};
                                newTranslations[code][s.id] = { ...existing, content: s.content || "", hasAudio: s.hasAudio ?? existing.hasAudio ?? false };
                                totalImported++;
                            }
                        });
                    } else {
                        Object.keys(slidesData).forEach(slideId => {
                            const s = slidesData[slideId];
                            const existing = newTranslations[code][slideId] || {};
                            newTranslations[code][slideId] = { ...existing, content: s.content || "", hasAudio: s.hasAudio ?? existing.hasAudio ?? false };
                            totalImported++;
                        });
                    }
                    langsFound.push(code);
                });

                onUpdate({
                    ...moduleData,
                    content: { ...moduleData.content, translations: newTranslations }
                });

                toast.success(`Success! Translated ${langsFound.length} languages.`, { id: toastId });
            } else {
                throw new Error("Invalid response format from AI");
            }

        } catch (error) {
            console.error("Translation Flow Error:", error);
            toast.error("Translation Error: " + (error as Error).message, { id: toastId });
        } finally {
            setIsTranslating(false);
        }
    };

    // 2.5 Recover from Cloud
    const handleRecoverFromCloud = async () => {
        if (!r2Domain || !moduleData.id) {
            toast.error("Missing R2 config or Module ID");
            return;
        }

        const safeName = (moduleData.title || 'module').replace(/[^a-z0-9]/gi, '_');
        const modeStr = activeMode === 'assessment' ? 'test' : 'training';
        const filename1 = `${moduleData.id}_${safeName}_${modeStr}_Languages.js`;
        const filename2 = `${moduleData.id}_${safeName}_${modeStr}_languages.js`;

        let url = `${r2Domain}/${moduleData.id}/${filename1}`;
        const toastId = toast.loading(`Checking for ${filename1}...`);

        try {
            let res = await fetch(url, { cache: 'no-store' });

            // If failed, try lowercase
            if (!res.ok) {
                toast.loading(`Trying ${filename2}...`, { id: toastId });
                url = `${r2Domain}/${moduleData.id}/${filename2}`;
                res = await fetch(url, { cache: 'no-store' });
            }

            if (!res.ok) {
                toast.error(`File not found: ${filename1} (or lowercase)`, { id: toastId });
                return;
            }

            const text = await res.text();

            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                toast.error("Invalid JSON in cloud file", { id: toastId });
                return;
            }

            // Consolidated Multi-Language Import Logic
            if (json.translations) {
                const newTranslations = { ...(moduleData.content?.translations || {}) };
                let totalImported = 0;
                let langsFound: string[] = [];
                Object.keys(json.translations).forEach(langCode => {
                    const langData = json.translations[langCode];
                    const slidesData = langData.slides || langData;
                    const code = langCode.trim().toLowerCase();
                    if (!newTranslations[code]) newTranslations[code] = {};

                    if (Array.isArray(slidesData)) {
                        slidesData.forEach((s: any) => {
                            if (s.id) {
                                const existing = newTranslations[code][s.id] || {};
                                newTranslations[code][s.id] = { ...existing, content: s.content || "", hasAudio: s.hasAudio ?? existing.hasAudio ?? false };
                                totalImported++;
                            }
                        });
                    } else {
                        Object.keys(slidesData).forEach(slideId => {
                            const s = slidesData[slideId];
                            const existing = newTranslations[code][slideId] || {};
                            newTranslations[code][slideId] = { ...existing, content: s.content || "", hasAudio: s.hasAudio ?? existing.hasAudio ?? false };
                            totalImported++;
                        });
                    }
                    langsFound.push(code);
                });

                onUpdate({
                    ...moduleData,
                    content: { ...moduleData.content, translations: newTranslations }
                });
                toast.success(`Recovered ${totalImported} slides from cloud`, { id: toastId });
            } else {
                toast.error("Cloud file format not recognized (missing translations key)", { id: toastId });
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to recover from cloud", { id: toastId });
        }
    };

    // 3. Batch Generate
    const handleBatchGenerate = async () => {
        const translations = moduleData.content?.translations || {};
        if (slides.length === 0) {
            toast.error("No slides");
            return;
        }
        const languages = Array.from(new Set(['en', ...Object.keys(translations)]));

        setIsGenerating(true);
        abortRef.current = false;
        let total = 0, success = 0, failed = 0, skipped = 0;

        try {
            for (const lang of languages) {
                if (abortRef.current) break;
                const langData = translations[lang] || {};

                for (let i = 0; i < slides.length; i++) {
                    if (abortRef.current) break;
                    const slide = slides[i];
                    const slideTrans = langData[slide.id];
                    const baseContent = extractSlideContent(slide);
                    const finalContent = slideTrans?.content || baseContent;

                    if (finalContent || slide.title || slideTrans?.title) {
                        const slideIndex = i + 1; // 1-based index relative to mode
                        const modeFolder = activeMode === 'assessment' ? 'test' : 'training';
                        const expectedAudioUrl = `${r2Domain}/${pathPrefix}${moduleData.id}/${modeFolder}/audio/${slideIndex}_${lang.toUpperCase()}.mp3`;

                        // CHECK: Does the audio file already exist in R2?
                        let audioExists = slideTrans?.hasAudio || false;
                        if (!audioExists && r2Domain) {
                            try {
                                const headRes = await fetch(expectedAudioUrl, { method: 'HEAD' });
                                audioExists = headRes.ok;
                                if (audioExists) {
                                    // Update the hasAudio flag in state
                                    if (!moduleData.content.translations) moduleData.content.translations = {};
                                    if (!moduleData.content.translations[lang]) moduleData.content.translations[lang] = {};
                                    moduleData.content.translations[lang][slide.id] = {
                                        ...(moduleData.content.translations[lang][slide.id] || {}),
                                        hasAudio: true
                                    };
                                }
                            } catch {
                                // HEAD request failed, assume audio doesn't exist
                            }
                        }

                        // Skip if audio already exists
                        if (audioExists) {
                            skipped++;
                            setProgress(`Skipping ${lang.toUpperCase()}: Slide ${slideIndex} (already exists)`);
                            continue;
                        }

                        const title = slideTrans?.title || slide.title || "";
                        const textToSpeak = finalContent;

                        setProgress(`Generating ${lang.toUpperCase()}: Slide ${slideIndex}...`);

                        const res = await generateAudioAssets(
                            textToSpeak,
                            lang,
                            {
                                moduleId: moduleData.id,
                                mode: activeMode === 'assessment' ? 'test' : 'training',
                                slideIndex: slideIndex,
                                moduleSlug: moduleData.slug // Fallback
                            }
                        );

                        if (res.success) {
                            success++;
                            // ... (Update state logic same as before)
                            if (!moduleData.content.translations) moduleData.content.translations = {};
                            if (!moduleData.content.translations[lang]) moduleData.content.translations[lang] = {};
                            const currentSlideRecord = moduleData.content.translations[lang][slide.id] || {};
                            moduleData.content.translations[lang][slide.id] = {
                                title: currentSlideRecord.title || (lang === 'en' ? slide.title : ""),
                                content: currentSlideRecord.content || (lang === 'en' ? "" : ""),
                                ...currentSlideRecord,
                                hasAudio: true
                            };
                        } else {
                            failed++;
                        }
                        total++;
                    }
                }
            }
            onUpdate({ ...moduleData });
            toast.success(`Batch Complete! ${success} generated, ${skipped} skipped (already exist).`);
        } catch (e) {
            console.error(e);
            toast.error("Error during generation");
        } finally {
            setIsGenerating(false);
            setProgress("");
        }
    };

    // Updated Get URL
    const getAudioUrl = (lang: string, slideIndex: number) => {
        if (!r2Domain || !moduleData.id) return null; // Need ID for new path

        // [pathPrefix]<module ID>/<training/test>/audio/<slide no>_<language>.mp3
        const modeFolder = activeMode === 'assessment' ? 'test' : 'training';
        return `${r2Domain}/${pathPrefix}${moduleData.id}/${modeFolder}/audio/${slideIndex}_${lang.toUpperCase()}.mp3`;
    };

    // Get stats
    const existingLangs = Object.keys(moduleData.content?.translations || {});
    // Use passed slides prop
    const slidesToRender = slides || [];

    if (!isMounted) return null; // Silent return to avoid UI jump

    return (
        // Removed overflow-hidden to prevent z-index clipping
        <div className="border border-white/10 rounded-2xl bg-[#0f172a]/50 relative z-[50]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LangIcon className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-200">Translations & Audio ({slidesToRender.length} Slides)</h3>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* 1. AI Translation Button */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleGenerateTranslation}
                        disabled={isTranslating}
                        type="button"
                        className="col-span-2 relative z-[100] cursor-pointer flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all border border-purple-400/20"
                    >
                        {isTranslating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing with GPT-4o-mini...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 fill-white/20" />
                                Generate Translation - GPT4o-mini
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleRecoverFromCloud}
                        className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recover from Cloud ({activeMode === 'assessment' ? 'Test' : 'Training'})
                    </button>
                </div>

                {/* Tabbed Interface */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Translations</h4>

                    {existingLangs.length === 0 ? (
                        <p className="text-xs text-slate-600 italic">No translations imported yet.</p>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                                {existingLangs.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setActiveTab(lang)}
                                        className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === lang
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                            {/* Active Tab Content */}
                            {activeTab && moduleData.content.translations && moduleData.content.translations[activeTab] && (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900/50 rounded-xl border border-white/5 p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                                            <LangIcon className="w-3.5 h-3.5 text-purple-400" />
                                            {activeTab} Content
                                        </h5>
                                        <span className="text-[10px] text-slate-500">
                                            Displaying {slidesToRender.length} Slides
                                        </span>
                                    </div>

                                    {slidesToRender.length === 0 && <p className="text-xs text-slate-500 italic">No slides in this section.</p>}

                                    {slidesToRender.map((slide: any, i: number) => {
                                        // Safe access
                                        const translations = moduleData.content?.translations || {};
                                        const langData = translations[activeTab!] || {};
                                        const slideTrans = langData[slide.id];
                                        const audioUrl = getAudioUrl(activeTab!, i + 1);

                                        if (!slideTrans) {
                                            return (
                                                <div key={slide.id} className="p-3 rounded bg-white/5 text-[11px] space-y-2 border border-white/5 opacity-50">
                                                    <div className="flex items-center justify-between text-slate-400 font-mono">
                                                        <span>Slide {i + 1}</span>
                                                        <span className="text-slate-600">No Translation Data</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={slide.id} className="p-3 rounded bg-white/5 text-[11px] space-y-2 border border-white/5">
                                                <div className="flex items-center justify-between text-slate-400 font-mono">
                                                    <span>Slide {i + 1}</span>
                                                    {slideTrans.hasAudio ? (
                                                        <span className="text-emerald-400 font-bold">✓ Audio generated</span>
                                                    ) : audioUrl ? (
                                                        <span className="text-blue-400 font-bold">Audio may exist - check player below</span>
                                                    ) : (
                                                        <span className="text-yellow-500 font-bold">Audio not generated</span>
                                                    )}
                                                </div>
                                                <div className="text-slate-200">
                                                    <span className="text-slate-500 font-bold block mb-1">Content:</span>
                                                    {slideTrans.content || <span className="italic text-slate-600">Using visual content...</span>}
                                                </div>
                                                {audioUrl && (
                                                    <div className="pt-2 flex items-center gap-2 border-t border-white/5 mt-2">
                                                        <Volume2 className="w-3 h-3 text-purple-400" />
                                                        <audio
                                                            controls
                                                            src={audioUrl}
                                                            className="h-6 w-full max-w-[200px]"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* Batch Generator */}
                <div className="pt-4 border-t border-white/10">
                    {isGenerating ? (
                        <button
                            onClick={handleStop}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <span className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" />
                            Stop Generation
                        </button>
                    ) : (
                        <button
                            onClick={handleBatchGenerate}
                            disabled={slidesToRender.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/20 disabled:text-purple-500/50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all"
                        >
                            <Play className="w-4 h-4" />
                            Generate All Audio Assets
                        </button>
                    )}

                    {progress && (
                        <div className="mt-3 text-center">
                            <span className="text-[10px] font-mono text-purple-300">{progress}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
