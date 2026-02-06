"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModuleEditorLayout } from "@/components/admin-dashboard/module-editor/layout";

import { SlideEditor } from "@/components/admin-dashboard/module-editor/slide-manager";
import { SlideNavigator } from "@/components/admin-dashboard/module-editor/slide-navigator";
import { MobileSimulator } from "@/components/admin-dashboard/module-editor/mobile-simulator";
import { TranslationManager } from "@/components/admin-dashboard/module-editor/translation-manager";
import { saveModule, getModule, getNextModuleId, importModule, getAvailableModules, getAudioConfig } from "@/app/actions/module-editor";
import { Save, Loader2, ArrowLeft, Upload, Download, BookOpen, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LoadModuleDialog } from "@/components/admin-dashboard/module-editor/load-module-dialog";
import { PublishDialog } from "@/components/admin-dashboard/module-editor/publish-dialog";
import { CreateModuleDialog } from "@/components/admin-dashboard/module-editor/create-module-dialog";
import { ProvisionWelcomeDialog } from "@/components/admin-dashboard/module-editor/provision-welcome-dialog";

import { ModuleData, SlideData, ModuleContent } from "./types";
import { loadModuleWithRecovery } from "./loader";

function EditModuleContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawId = searchParams.get("id");
    const moduleId = rawId ? parseInt(rawId) : null;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Unified Module State
    const [activeMode, setActiveMode] = useState<'training' | 'assessment'>('training');
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const [moduleData, setModuleData] = useState<ModuleData>({
        title: "New Safety Module",
        slug: `module-${Date.now()}`,
        isPublished: false,
        type: 'TRAINING',
        content: {
            training: { slides: [{ id: "1", title: "Introduction", content: "Welcome to this safety module.", narration: "", elements: [] }] },
            assessment: { slides: [] }
        },
        pass_marks: 0,
        total_marks: 0
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!moduleId);
    const [nextId, setNextId] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [r2Domain, setR2Domain] = useState<string>("");
    const [pathPrefix, setPathPrefix] = useState<string>("");

    useEffect(() => {
        getAudioConfig().then(res => {
            if (res.success && res.r2Domain) setR2Domain(res.r2Domain);
        });
    }, []);

    // Helper to get active slides based on mode
    const getActiveSlides = () => {
        return moduleData.content?.[activeMode]?.slides || [];
    };

    // Calculate Total Marks dynamically from ASSESSMENT content
    const calculatedTotalMarks = moduleData.content?.assessment?.slides?.reduce((acc: number, slide: SlideData) => {
        const slideMarks = slide.elements?.reduce((sAcc: number, el: any) => {
            return sAcc + (el.type === 'quiz' ? (el.marks || 0) : 0);
        }, 0) || 0;
        return acc + slideMarks;
    }, 0) || 0;

    // Update total marks in state when content changes
    useEffect(() => {
        if (calculatedTotalMarks !== moduleData.total_marks) {
            setModuleData((prev) => ({ ...prev, total_marks: calculatedTotalMarks }));
        }
    }, [calculatedTotalMarks]);

    useEffect(() => {
        const initData = async () => {
            if (moduleId) {
                setIsLoading(true);
                setCurrentIndex(0);
                setActiveMode('training');
                setPathPrefix("");

                // Fetch r2Domain if not already set (needed for loader)
                let localR2Domain = r2Domain;
                if (!localR2Domain) {
                    const configRes = await getAudioConfig();
                    if (configRes.success && configRes.r2Domain) {
                        localR2Domain = configRes.r2Domain;
                        setR2Domain(localR2Domain);
                    }
                }

                const data = await loadModuleWithRecovery(moduleId, localR2Domain);

                if (data) {
                    // Auto-switch mode if training empty but assessment has content
                    if (data.content.training.slides.length === 0 && data.content.assessment.slides.length > 0) {
                        setActiveMode('assessment');
                    }
                    setModuleData(data);
                } else {
                    toast.error("Failed to load module");
                }
                setIsLoading(false);
            } else {
                // New Module
                const nextIdRes = await getNextModuleId();
                if (nextIdRes.success && nextIdRes.data) setNextId(nextIdRes.data);

                setModuleData({
                    title: "New Safety Module",
                    slug: `module-${Date.now()}`,
                    isPublished: false,
                    type: 'TRAINING',
                    content: {
                        training: { slides: [{ id: "1", title: "Introduction", content: "Welcome...", type: 'text', style: { width: 100 }, elements: [] } as any] },
                        assessment: { slides: [] }
                    },
                    pass_marks: 0,
                    total_marks: 0
                });
                setCurrentIndex(0);
                setActiveMode('training');
            }
        };

        initData();
    }, [moduleId]); // Dependency mainly on ID

    const handleSave = async (action: 'save' | 'publish' = 'save') => {
        setIsSaving(true);
        try {
            // Preserve existing type if available, default to TRAINING for hybrids
            const dataToSave = { ...moduleData, type: moduleData.type || 'TRAINING' };

            const res = await saveModule(moduleId, dataToSave, action);

            setIsSaving(false);
            if (res.success) {
                toast.success(action === 'publish' ? "Module Published!" : "Module Saved!");

                // Sync state with saved data
                if (res.data) {
                    setModuleData((prev) => ({
                        ...prev,
                        ...res.data,
                        content: (res.data.content as unknown as ModuleContent) || prev.content,
                        isPublished: res.data.is_published
                    }));
                }

                if (!moduleId && res.data?.id) {
                    router.replace(`/admin/modules/provision?id=${res.data.id}`);
                }
            } else {
                toast.error(res.error || "Save failed");
            }
        } catch (e) {
            console.error(e);
            setIsSaving(false);
            toast.error("An unexpected error occurred");
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-teal-500">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    const isEditorActive = !!moduleId;

    const header = !isEditorActive ? (
        // --- INITIAL STATE HEADER ---
        <div className="px-6 py-4 flex items-center justify-between w-full h-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-4">
                <Link href="/admin/modules" className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-xs font-black text-teal-500 uppercase tracking-[0.4em] italic leading-none">Module Maker</h1>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Status: Pending Selection</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <LoadModuleDialog
                    trigger={
                        <button className="flex items-center gap-2 px-5 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-white/5">
                            <BookOpen className="w-4 h-4" />
                            Load Module
                        </button>
                    }
                />
                <CreateModuleDialog
                    className="flex items-center gap-2 px-5 h-10 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all"
                />
            </div>

            <ProvisionWelcomeDialog open={!moduleId} onOpenChange={() => { }} />
        </div>
    ) : (
        // --- EDITOR STATE HEADER ---
        <div className="px-6 py-4 flex items-center justify-between w-full h-full">
            <div className="flex items-center gap-4">
                <Link href="/admin/modules" className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white tracking-tight">Module Editor</h1>
                        {moduleData?.title && <span className="text-sm text-slate-500 font-medium">/ {moduleData.title}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* ID & Name */}
                <div className="flex items-center bg-slate-900 rounded-xl border border-white/10 overflow-hidden h-9">
                    <div className="px-3 border-r border-white/10 h-full flex items-center bg-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">ID</span>
                    </div>
                    <div className="px-3 min-w-[40px] flex items-center justify-center">
                        <span className="text-xs text-teal-400 font-mono font-bold">
                            {moduleId ? `#${moduleId}` : (nextId ? `#${nextId}` : "...")}
                        </span>
                    </div>
                </div>

                <div className="flex items-center bg-slate-900 rounded-xl border border-white/10 overflow-hidden h-9 w-48 focus-within:border-teal-500/50 transition-colors">
                    <div className="px-3 border-r border-white/10 h-full flex items-center bg-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Title</span>
                    </div>
                    <input
                        value={moduleData.title}
                        onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                        className="bg-transparent text-xs text-white px-3 focus:outline-none w-full placeholder:text-slate-600 font-medium"
                        placeholder="Module Name"
                    />
                </div>

                {/* MODE SWITCHER */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 h-9">
                    <button
                        onClick={() => { setActiveMode('training'); setCurrentIndex(0); }}
                        className={`flex items-center gap-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeMode === 'training' ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <BookOpen size={12} className={activeMode === 'training' ? 'text-slate-900' : 'text-teal-500'} /> Training
                    </button>
                    <button
                        onClick={() => { setActiveMode('assessment'); setCurrentIndex(0); }}
                        className={`flex items-center gap-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeMode === 'assessment' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <GraduationCap size={12} className={activeMode === 'assessment' ? 'text-slate-900' : 'text-amber-500'} /> Assessment
                    </button>
                </div>

                {/* Assessment Marks (Only in Assessment Mode) */}
                {activeMode === 'assessment' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="flex items-center bg-slate-900 rounded-xl border border-white/10 overflow-hidden h-9">
                            <div className="px-3 border-r border-white/10 h-full flex items-center bg-white/5">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Total Marks</span>
                            </div>
                            <div className="px-3 min-w-[40px] flex items-center justify-center">
                                <span className="text-xs text-white font-mono font-bold">{calculatedTotalMarks}</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-slate-900 rounded-xl border border-white/10 overflow-hidden h-9 w-28 focus-within:border-amber-500/50 transition-colors">
                            <div className="px-3 border-r border-white/10 h-full flex items-center bg-white/5">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Pass</span>
                            </div>
                            <input
                                type="number"
                                value={moduleData.pass_marks || 0}
                                onChange={(e) => setModuleData({ ...moduleData, pass_marks: parseInt(e.target.value) })}
                                className="bg-transparent text-xs text-white px-3 focus:outline-none w-full appearance-none font-bold"
                            />
                        </div>
                    </div>
                )}

                <div className="w-px h-6 bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                    <LoadModuleDialog />

                    {moduleId && (
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={`/api/modules/export?id=${moduleId}`}
                            className="flex items-center justify-center w-9 h-9 bg-slate-900 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all"
                            title="Export Module (ZIP)"
                        >
                            <Download className="w-4 h-4" />
                        </motion.a>
                    )}
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave('save')}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 h-9 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-white/5"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPublishDialogOpen(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 h-9 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all"
                    >
                        <ShieldCheck size={14} />
                        Publish
                    </motion.button>
                </div>

                <PublishDialog
                    open={publishDialogOpen}
                    onOpenChange={setPublishDialogOpen}
                    onPublish={() => handleSave('publish')}
                    moduleData={moduleData}
                />
            </div>
        </div>
    );

    return (
        <ModuleEditorLayout
            header={header}
            leftPanel={
                isEditorActive ? (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar Slide Navigator */}
                        <div className="w-32 h-full shrink-0">
                            <SlideNavigator
                                slides={getActiveSlides()}
                                currentIndex={currentIndex}
                                onSelect={setCurrentIndex}
                                onReorder={(slides) => setModuleData({
                                    ...moduleData,
                                    content: {
                                        ...moduleData.content,
                                        [activeMode]: { ...moduleData.content[activeMode], slides }
                                    }
                                })}
                                onAdd={() => {
                                    const newSlide: SlideData = {
                                        id: `slide-${Date.now()}`,
                                        title: "New Slide",
                                        content: "Enter content here...",
                                        narration: "",
                                        elements: []
                                    };
                                    const currentSlides = getActiveSlides();
                                    setModuleData({
                                        ...moduleData,
                                        content: {
                                            ...moduleData.content,
                                            [activeMode]: {
                                                ...moduleData.content[activeMode],
                                                slides: [...currentSlides, newSlide]
                                            }
                                        }
                                    });
                                    setCurrentIndex(currentSlides.length);
                                }}
                                onDelete={(index) => {
                                    if (confirm("Are you sure you want to delete this slide?")) {
                                        const newSlides = [...getActiveSlides()];
                                        newSlides.splice(index, 1);
                                        setModuleData({
                                            ...moduleData,
                                            content: {
                                                ...moduleData.content,
                                                [activeMode]: { ...moduleData.content[activeMode], slides: newSlides }
                                            }
                                        });
                                        if (currentIndex >= newSlides.length && newSlides.length > 0) {
                                            setCurrentIndex(newSlides.length - 1);
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Main Slide Editor */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]/30">
                            <SlideEditor
                                key={`${activeMode}-${currentIndex}`} // Force re-render on mode switch
                                slide={getActiveSlides()[currentIndex] || null}
                                moduleType={activeMode === 'assessment' ? 'TEST' : 'TRAINING'} // Map mode to type
                                moduleId={moduleId || undefined}
                                slideIndex={currentIndex + 1}
                                onUpdate={(updatedSlide) => {
                                    const newSlides = [...getActiveSlides()];
                                    newSlides[currentIndex] = updatedSlide;
                                    // Use functional update to ensure fresh state
                                    setModuleData((prev) => ({
                                        ...prev,
                                        content: {
                                            ...prev.content,
                                            [activeMode]: { ...prev.content[activeMode], slides: newSlides }
                                        }
                                    }));
                                }}
                            />

                            {/* Meta / Translation Tools Footer */}
                            <div className="p-8 border-t border-white/5 mt-8">
                                <TranslationManager
                                    moduleData={moduleData}
                                    slides={getActiveSlides()} // Pass active slides
                                    activeMode={activeMode}
                                    onUpdate={setModuleData}
                                    pathPrefix={pathPrefix}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617]/40 h-full">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 opacity-20">
                            <Sparkles className="w-10 h-10 text-teal-400" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 italic">No Module Selected</p>
                        <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest mt-4">Please select or create a module to begin editing.</p>
                    </div>
                )
            }
            rightPanel={
                isEditorActive ? (
                    <MobileSimulator
                        data={moduleData}
                        slides={getActiveSlides()}
                        currentIndex={currentIndex}
                        onIndexChange={setCurrentIndex}
                        mode={activeMode === 'assessment' ? 'test' : 'training'}
                        pathPrefix={pathPrefix}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full bg-black/10">
                        <div className="w-[300px] h-[600px] rounded-[3.5rem] border-2 border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-4 opacity-10">
                            <div className="w-12 h-1 rounded-full bg-white/10" />
                            <div className="flex-1" />
                            <div className="w-12 h-12 rounded-full border-2 border-white/10" />
                        </div>
                    </div>
                )
            }
        />
    );
}

export default function ProvisionModulePage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#020617] text-white flex items-center justify-center">Loading Studio...</div>}>
            <EditModuleContent />
        </Suspense>
    );
}
