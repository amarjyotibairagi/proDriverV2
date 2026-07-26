"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
    ChevronLeft, ChevronRight, Volume2, VolumeX,
    RotateCcw, Play, Pause, CheckCircle2, XCircle,
    AlertCircle, Trophy, Home as HomeIcon, RefreshCcw, Video, GripVertical,
    Settings, Music, X, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { LANGUAGES } from "@/lib/languages";
import { getAudioConfig } from "@/app/actions/module-editor";
import { SlideElement, ImageSliderSlide, SequenceStep } from "@/app/admin/modules/provision/types";
import { IconRenderer } from "@/components/admin-dashboard/module-editor/icon-mapper";
import { getRandomEntryAnimation } from "@/lib/animation-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeTrainingAction, completeTestAction } from "@/app/actions/driver-training";
import confetti from 'canvas-confetti';

interface ModulePlayerProps {
    moduleId: number;
    slides: any[];
    mode: 'training' | 'test';
    moduleTitle: string;
    translations?: any;
    initialLang?: string;
    totalMarks?: number;
}

export function ModulePlayer({
    moduleId,
    slides,
    mode,
    moduleTitle,
    translations = {},
    initialLang = 'en',
    totalMarks = 100
}: ModulePlayerProps) {
    console.log(`[ModulePlayer] Initial Lang Prop: ${initialLang}`);
    console.log(`[ModulePlayer] Translations Keys: ${Object.keys(translations)}`);

    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLang, setSelectedLang] = useState(initialLang);
    const [r2Domain, setR2Domain] = useState<string>("");

    // Audio Settings
    const [showSettings, setShowSettings] = useState(false);
    const [voiceVolume, setVoiceVolume] = useState(1.0);
    const [bgVolume, setBgVolume] = useState(0.15);

    // Player State
    const [isPlayerLoading, setIsPlayerLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioEnded, setAudioEnded] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [animationsDone, setAnimationsDone] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [quizSelections, setQuizSelections] = useState<Record<string, string>>({});
    const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
    const [sliderIndices, setSliderIndices] = useState<Record<string, number>>({}); // ElementID -> Current Slide Index
    const [sequenceOrder, setSequenceOrder] = useState<Record<string, SequenceStep[]>>({}); // SlideID -> Ordered Steps
    const [sequenceChecker, setSequenceChecker] = useState<Record<string, boolean | null>>({}); // SlideID -> true(correct)/false(wrong)/null
    const [splitResults, setSplitResults] = useState<Record<string, 'correct' | 'incorrect' | null>>({}); // SlideID -> Result // Currently displayed feedback

    // Completion State
    const [result, setResult] = useState<{
        show: boolean;
        passed: boolean;
        score?: number;
        passMarks?: number;
        error?: string;
    } | null>(null);

    const isRtl = useMemo(() => {
        return LANGUAGES.find(l => l.code === selectedLang)?.dir === 'rtl';
    }, [selectedLang]);
    // Audio Ref
    const audioRef = useRef<HTMLAudioElement>(null);
    const bgAudioRef = useRef<HTMLAudioElement>(null);

    const triggerFireworks = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };
    // Volume Management
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = voiceVolume;
        }
    }, [voiceVolume]);

    useEffect(() => {
        if (bgAudioRef.current) {
            bgAudioRef.current.volume = bgVolume;
        }
    }, [bgVolume]);

    // Background Audio Logic
    useEffect(() => {
        if (hasStarted && bgAudioRef.current) {
            bgAudioRef.current.volume = bgVolume;
            const playPromise = bgAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Background Audio Auto-play prevented:", error);
                });
            }
        } else if (!hasStarted && bgAudioRef.current) {
            bgAudioRef.current.pause();
            bgAudioRef.current.currentTime = 0;
        }
    }, [hasStarted]);

    useEffect(() => {
        getAudioConfig().then(res => {
            if (res.success && res.r2Domain) {
                setR2Domain(res.r2Domain);
            }
        });
    }, []);

    // Ensure index is valid for render
    const safeIndex = (currentIndex >= slides.length && slides.length > 0) ? 0 : currentIndex;
    const sourceSlide = slides[safeIndex];

    // Language Direction
    const currentLangObj = LANGUAGES.find(l => l.code === selectedLang);
    const dir = currentLangObj?.dir || 'ltr';

    useEffect(() => {
        if (sourceSlide) {
            // Initialize Sequence Sorters
            const sorters = sourceSlide.elements.filter((el: SlideElement) => el.type === 'sequence-sorter');
            if (sorters.length > 0) {
                const newOrders: Record<string, SequenceStep[]> = {};
                sorters.forEach((el: SlideElement) => {
                    if (el.sequenceSteps) {
                        // Shuffle steps for initial state
                        const shuffled = [...el.sequenceSteps].sort(() => Math.random() - 0.5);
                        newOrders[el.id] = shuffled;
                    }
                });
                setSequenceOrder(prev => ({ ...prev, ...newOrders }));
                // Reset checker
                const newChecks: Record<string, boolean | null> = {};
                sorters.forEach((el: SlideElement) => newChecks[el.id] = null);
                setSequenceChecker(prev => ({ ...prev, ...newChecks }));
            }
        }
    }, [sourceSlide, safeIndex]);

    const nextSlide = () => {
        if (safeIndex < slides.length - 1) {
            setAudioEnded(false);
            setAudioFailed(false);
            setAnimationsDone(false);
            setQuizSelections({});
            setQuizResults({});
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished
            handleFinish();
        }
    }

    const prevSlide = () => {
        if (safeIndex > 0) {
            // Simply go back, state remains (audio might replay)
            setAudioEnded(false);
            setAudioFailed(false);
            setAnimationsDone(false);
            setCurrentIndex(prev => prev - 1);
        }
    }

    const handleFinish = async () => {
        setIsPlayerLoading(true);
        try {
            if (mode === 'training') {
                const res = await completeTrainingAction(moduleId);
                if (res.success) {
                    setResult({ show: true, passed: true });
                    triggerFireworks();
                } else {
                    setResult({ show: true, passed: false, error: res.error });
                }
            } else {
                const totalQuizzes = elementsWithTranslations.filter((el: SlideElement) => el.type === 'quiz').length;
                const correctCount = Object.values(quizResults).filter(val => val === true).length;

                const finalScore = totalQuizzes > 0
                    ? Math.round((correctCount / totalQuizzes) * totalMarks)
                    : totalMarks;

                const res = await completeTestAction(moduleId, finalScore);
                if (res.success) {
                    setResult({
                        show: true,
                        passed: res.isPassed || false,
                        score: finalScore,
                        passMarks: res.passMarks
                    });
                    if (res.isPassed) triggerFireworks();
                } else {
                    setResult({ show: true, passed: false, error: res.error });
                }
            }
        } catch (error) {
            console.error("Completion Error:", error);
            setResult({ show: true, passed: false, error: "An unexpected error occurred." });
        } finally {
            setIsPlayerLoading(false);
        }
    }

    const handleUserStart = () => {
        setHasStarted(true);
        setIsPlaying(true);
    };

    // Helper: Smart Font Scaling
    const getDynamicFontSize = (content: string) => {
        if (!content) return 'text-base';
        const len = content.length;
        if (len < 40) return 'text-xl sm:text-2xl font-bold';
        if (len < 100) return 'text-lg sm:text-xl font-medium';
        if (len < 200) return 'text-base sm:text-lg';
        return 'text-sm sm:text-base'; // Smaller for lots of text
    };

    // ... (Audio URL Helpers remain same) ...


    // Resolve Audio URL
    // Helper: Get Audio URL
    const getAudioUrl = (slideIndex: number, langCode: string) => {
        if (!r2Domain) return null;
        // Path: <id>/<mode>/audio/<index>_<lang>.mp3
        return `${r2Domain}/${moduleId}/${mode}/audio/${slideIndex}_${langCode}.mp3`;
    };

    const currentAudioUrl = useMemo(() => {
        if (!sourceSlide) return null;
        const index = safeIndex + 1;
        const langCode = selectedLang.toUpperCase();
        const url = getAudioUrl(index, langCode);
        console.log("DEBUG: Audio URL:", url);
        return url;
    }, [r2Domain, sourceSlide, safeIndex, selectedLang, moduleId, mode]);

    // Resolve Elements with Translations
    const elementsWithTranslations = useMemo(() => {
        if (!sourceSlide) return [];

        console.log("DEBUG: Translating Slide", {
            slideId: sourceSlide.id,
            selectedLang,
            availableLangs: Object.keys(translations),
            hasTranslationForLang: !!translations[selectedLang]
        });

        let translationData = null;
        if (selectedLang !== 'en' && translations[selectedLang]) {
            const langData = translations[selectedLang];
            console.log("DEBUG: Lang Data Keys", Object.keys(langData));

            const slideId = sourceSlide.id;
            const slideIndexStr = String(currentIndex + 1); // Fallback: try using 1-based index as key

            // Robust Lookup: properties might be nested or direct, and keys might be string/number mixed
            // 1. Try Direct: langData[id]
            // 2. Try Nested: langData.slides[id]
            // 3. Fallback: Try Index string

            const strategies = [
                (data: any) => slideId ? data[slideId] : undefined,
                (data: any) => slideId ? data[String(slideId)] : undefined,
                (data: any) => data.slides && slideId && data.slides[slideId],
                (data: any) => data.slides && slideId && data.slides[String(slideId)],
                (data: any) => data[slideIndexStr], // Fallback to index
                (data: any) => data.slides && data.slides[slideIndexStr]
            ];

            for (const strat of strategies) {
                const found = strat(langData);
                if (found) {
                    translationData = found;
                    break;
                }
            }

            if (!translationData) {
                console.warn("DEBUG: No translation found for slide ID:", slideId, "Index:", slideIndexStr);
            }
        }

        const fullTranslatedText = translationData?.content || null;
        console.log("DEBUG: Resolved Text Content:", fullTranslatedText ? fullTranslatedText.substring(0, 50) + "..." : "None");

        if (!fullTranslatedText) return sourceSlide.elements || [];

        const parts = fullTranslatedText.split('\n\n');
        let partIdx = 0;

        return (sourceSlide.elements || []).map((el: SlideElement) => {
            if (el.type === 'text') {
                const displayContent = parts[partIdx] || el.content;
                partIdx++;
                return { ...el, content: displayContent };
            } else if (el.type === 'quiz') {
                const questionContent = parts[partIdx] || el.content;
                partIdx++;
                const translatedOptions = (el.quizOptions || []).map(opt => {
                    const optText = parts[partIdx] || opt.text;
                    partIdx++;
                    return { ...opt, text: optText };
                });
                return { ...el, content: questionContent, quizOptions: translatedOptions };
            }
            return el;
        });
    }, [sourceSlide, selectedLang, translations]);

    // Unified Text Scaling Logic
    const elementsWithUnifiedScaling = useMemo(() => {
        const processed: (SlideElement & { sectionFontSize?: string })[] = [];
        let currentTextGroup: (SlideElement & { sectionFontSize?: string })[] = [];

        const flushGroup = () => {
            if (currentTextGroup.length === 0) return;
            // Calculate total length of this continuous text block
            const totalLength = currentTextGroup.reduce((acc, curr) => acc + (curr.content?.length || 0), 0);

            // Generate a dummy string of this length to reuse the sizing logic
            const sizeClass = getDynamicFontSize("a".repeat(totalLength));

            // Apply this size to all elements in the group
            currentTextGroup.forEach(el => {
                processed.push({ ...el, sectionFontSize: sizeClass });
            });
            currentTextGroup = [];
        };

        elementsWithTranslations.forEach((el: SlideElement) => {
            if (el.type === 'text') {
                currentTextGroup.push({ ...el });
            } else {
                // Break in sequence (image, quiz, etc.)
                flushGroup();
                processed.push({ ...el });
            }
        });
        flushGroup(); // Flush any remaining at the end
        return processed;
    }, [elementsWithTranslations]);

    // Animations
    const elementAnimations = useMemo(() => {
        if (!sourceSlide?.elements) return [];

        const nonImageElements = sourceSlide.elements.filter((el: any) => el.type !== 'image');
        const elementCount = nonImageElements.length;

        const interval = audioDuration > 0
            ? (audioDuration / elementCount)
            : 0.5;

        let lastNonImageDelay = 0;
        let speechIdx = 0;

        return sourceSlide.elements.map((el: any) => {
            if (el.type !== 'image') {
                lastNonImageDelay = speechIdx * interval;
                speechIdx++;
                return getRandomEntryAnimation(lastNonImageDelay, 0.5);
            } else {
                // Images appear with the PREVIOUS text/quiz element
                return getRandomEntryAnimation(lastNonImageDelay, 0.5);
            }
        });
    }, [sourceSlide?.elements, audioDuration]);

    useEffect(() => {
        if (hasStarted && sourceSlide?.elements) {
            const nonImageElements = sourceSlide.elements.filter((el: any) => el.type !== 'image');
            const elementCount = nonImageElements.length;

            const interval = audioDuration > 0
                ? (audioDuration / elementCount)
                : 0.5;

            // Max delay is for the last element: (N-1) * interval
            const maxDelayAt = (elementCount > 0 ? (elementCount - 1) : 0) * interval;
            const totalWaitTime = maxDelayAt + 0.5;

            const timer = setTimeout(() => {
                setAnimationsDone(true);
            }, totalWaitTime * 1000);
            return () => clearTimeout(timer);
        } else {
            setAnimationsDone(true);
        }
    }, [hasStarted, sourceSlide, audioDuration]);

    // Auto Play Audio
    useEffect(() => {
        if (hasStarted && isPlaying && audioRef.current && currentAudioUrl) {
            setAudioEnded(false);
            const timer = setTimeout(() => {
                audioRef.current?.play().catch(e => console.log("Autoplay blocked", e));
            }, 500);
            return () => clearTimeout(timer);
        } else if (!currentAudioUrl) {
            // If no audio, mark as ended immediately so user can proceed
            setAudioEnded(true);
        }
    }, [safeIndex, currentAudioUrl, isPlaying, hasStarted]);


    // Quiz Logic
    const allQuizzesAnswered = useMemo(() => {
        const quizzes = elementsWithTranslations.filter((el: SlideElement) => el.type === 'quiz');
        if (quizzes.length === 0) return true;
        return quizzes.every((q: SlideElement) => quizSelections[q.id]);
    }, [elementsWithTranslations, quizSelections]);



    const allSequencesCorrect = useMemo(() => {
        const sorterEls = elementsWithUnifiedScaling.filter(el => el.type === 'sequence-sorter');
        if (sorterEls.length === 0) return true;
        return sorterEls.every(el => sequenceChecker[el.id] === true);
    }, [elementsWithUnifiedScaling, sequenceChecker]);

    const handleSelectChoice = (elId: string, optId: string, quizEl: SlideElement) => {
        if (!isPlaying) return;
        if (quizSelections[elId]) return;

        setQuizSelections(prev => ({ ...prev, [elId]: optId }));

        const correctOption = (quizEl.quizOptions || []).find(opt => opt.isCorrect);
        const isCorrect = correctOption?.id === optId;
        setQuizResults(prev => ({ ...prev, [elId]: isCorrect }));
    };



    const canAdvance = (audioEnded || audioFailed) && animationsDone && (mode === 'training' || allQuizzesAnswered) && allSequencesCorrect;

    return (
        <div className="fixed inset-0 w-full bg-neutral-950 flex items-center justify-center font-sans overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Main Player Container - Full screen on mobile, capped on desktop */}
            <div className="w-full h-full max-w-[500px] sm:h-[90vh] sm:aspect-[9/16] bg-[#020617] text-white flex flex-col relative sm:shadow-2xl overflow-hidden sm:ring-1 sm:ring-white/10 sm:rounded-[2.5rem]">

                {/* Header */}
                <div className="shrink-0 bg-slate-900 border-b border-white/10 p-3 sm:p-4 flex items-center justify-between z-50 shadow-md">
                    <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-95">
                        <HomeIcon className="w-5 h-5" />
                    </Link>
                    <div className="text-center flex-1 mx-2">
                        <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest truncate max-w-[200px] mx-auto">{moduleTitle}</h1>
                        <p className="text-[10px] text-teal-500 font-bold uppercase">{mode}</p>
                    </div>

                    <div className="flex gap-2 shrink-0 relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-1.5 rounded-lg border transition-all ${showSettings ? 'bg-teal-500 border-teal-500 text-slate-900' : 'bg-slate-800 border-white/20 text-slate-400 hover:text-white'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        <select
                            value={selectedLang}
                            onChange={(e) => {
                                setSelectedLang(e.target.value);
                                setHasStarted(false);
                                setAudioEnded(false);
                                setIsPlaying(false);
                            }}
                            className="bg-slate-800 border border-white/20 text-xs rounded px-2 py-1.5 text-white focus:outline-none focus:border-teal-500"
                        >
                            {Array.from(new Set(['en', ...Object.keys(translations)])).map(lang => (
                                <option key={lang} value={lang} className="bg-slate-900 text-white">
                                    {LANGUAGES.find(l => l.code === lang)?.name || lang}
                                </option>
                            ))}
                        </select>

                        {/* Volume Settings Popup */}
                        {showSettings && (
                            <div className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-2 z-[60] bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl w-64 space-y-4 animate-in fade-in slide-in-from-top-2`}>
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Audio Mixer</h3>
                                    <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Voice Volume */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Voice</span>
                                        <span className="text-teal-400">{Math.round(voiceVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={voiceVolume}
                                        onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>

                                {/* Background Volume */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Ambience</span>
                                        <span className="text-teal-400">{Math.round(bgVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={bgVolume}
                                        onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full mx-auto relative flex flex-col overflow-hidden">

                    {/* Start Overlay */}
                    {!hasStarted && (
                        <div className="absolute inset-0 z-40 bg-[#020617]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-8 p-6 text-center">
                            <button
                                onClick={handleUserStart}
                                className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.5)] group transition-all hover:scale-110 active:scale-95 animate-pulse"
                            >
                                <Play className="w-10 h-10 text-slate-900 ml-1" />
                            </button>
                            <div className="space-y-2">
                                <p className="text-sm text-white font-bold uppercase tracking-widest">Tap to Start</p>
                                <p className="text-xs text-slate-400">Turn up your volume</p>
                            </div>
                        </div>
                    )}

                    {/* SLIDES SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-8 py-6 space-y-6 flex flex-col" dir={dir}>
                        <style jsx>{`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}</style>
                        <AnimatePresence mode="wait">
                            {hasStarted && (
                                <motion.div
                                    key={safeIndex}
                                    className="flex flex-col gap-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {elementsWithUnifiedScaling.map((el: SlideElement & { sectionFontSize?: string }, idx: number) => {
                                        const variants = elementAnimations[idx];
                                        return (
                                            <motion.div
                                                key={el.id}
                                                initial="hidden"
                                                animate="visible"
                                                variants={variants}
                                                className="w-full"
                                            >
                                                {el.type === 'image' ? (
                                                    <div className="w-full rounded-2xl overflow-hidden bg-black/20 flex justify-center shadow-inner border border-white/5" style={{ height: el.style.height ? `${el.style.height * 3}px` : 'auto', minHeight: '180px', maxHeight: '35vh' }}>
                                                        {el.content?.startsWith('icon:') ? (
                                                            <IconRenderer name={el.content} className="w-2/3 h-full object-contain py-4" style={{ color: el.style.color || 'white' }} />
                                                        ) : (
                                                            <img src={el.content} className="w-full h-full object-contain" alt="" />
                                                        )}
                                                    </div>
                                                ) : el.type === 'image-slider' ? (
                                                    <div className="w-full space-y-4">
                                                        {el.sliderSlides && el.sliderSlides.length > 0 ? (
                                                            <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/10 flex flex-col">
                                                                <div className="flex-1 relative overflow-hidden">
                                                                    <AnimatePresence mode="wait">
                                                                        <motion.img
                                                                            key={sliderIndices[el.id] || 0}
                                                                            src={el.sliderSlides[sliderIndices[el.id] || 0].imageUrl}
                                                                            initial={{ opacity: 0, x: 20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            exit={{ opacity: 0, x: -20 }}
                                                                            transition={{ duration: 0.3 }}
                                                                            className="w-full h-full object-contain"
                                                                            alt="Slide"
                                                                        />
                                                                    </AnimatePresence>
                                                                </div>

                                                                <div className="bg-slate-900/90 backdrop-blur p-4 border-t border-white/10 flex items-center justify-between gap-4">
                                                                    <button
                                                                        onClick={() => setSliderIndices(prev => ({ ...prev, [el.id]: Math.max(0, (prev[el.id] || 0) - 1) }))}
                                                                        disabled={(sliderIndices[el.id] || 0) === 0}
                                                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                                                                    >
                                                                        <ChevronLeft className="w-5 h-5" />
                                                                    </button>

                                                                    <div className="flex-1 text-center">
                                                                        <p className="text-sm font-medium text-white mb-2">
                                                                            {el.sliderSlides[sliderIndices[el.id] || 0].description}
                                                                        </p>
                                                                        <div className="flex justify-center gap-1.5">
                                                                            {el.sliderSlides.map((_, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${(sliderIndices[el.id] || 0) === idx ? 'bg-teal-500' : 'bg-white/20'}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => setSliderIndices(prev => ({ ...prev, [el.id]: Math.min((el.sliderSlides?.length || 1) - 1, (prev[el.id] || 0) + 1) }))}
                                                                        disabled={(sliderIndices[el.id] || 0) === (el.sliderSlides?.length || 1) - 1}
                                                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                                                                    >
                                                                        <ChevronRight className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full aspect-video flex items-center justify-center bg-slate-800/50 rounded-2xl border border-white/10 text-slate-500 text-sm">
                                                                No slides available
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : el.type === 'quiz' ? (
                                                    <div className="space-y-4 bg-slate-800/50 p-5 rounded-2xl border border-white/10 shadow-sm">
                                                        <p className="font-bold text-lg leading-relaxed text-white">{el.content}</p>
                                                        <div className="space-y-3">
                                                            {el.quizOptions?.map(opt => {
                                                                const isSelected = quizSelections[el.id] === opt.id;
                                                                const hasAnswered = quizResults[el.id] !== undefined;
                                                                const isCorrect = opt.isCorrect;

                                                                let className = "w-full p-4 sm:p-5 rounded-2xl border text-start transition-all flex items-center gap-4 active:scale-[0.96] shadow-sm ";
                                                                if (hasAnswered) {
                                                                    if (isCorrect) className += "border-green-500 bg-green-500/10 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                                                                    else if (isSelected) className += "border-red-500 bg-red-500/10 text-red-100";
                                                                    else className += "border-white/5 opacity-50 grayscale";
                                                                } else {
                                                                    if (isSelected) className += "border-teal-500 bg-teal-500/10 text-teal-100";
                                                                    else className += "border-white/10 bg-white/5 hover:bg-white/10";
                                                                }

                                                                return (
                                                                    <button
                                                                        key={opt.id}
                                                                        onClick={() => handleSelectChoice(el.id, opt.id, el)}
                                                                        disabled={hasAnswered}
                                                                        className={className}
                                                                    >
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${hasAnswered && isCorrect ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                                                            {hasAnswered && isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                        </div>
                                                                        <span className="text-sm font-medium">{opt.text}</span>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : el.type === 'sequence-sorter' ? (
                                                    <div className="w-full space-y-4">
                                                        <p className="font-bold text-lg text-white mb-2">Arrange in the correct order:</p>
                                                        {sequenceOrder[el.id] && (
                                                            <Reorder.Group
                                                                axis="y"
                                                                values={sequenceOrder[el.id]}
                                                                onReorder={(newOrder) => {
                                                                    if (sequenceChecker[el.id] !== true) {
                                                                        setSequenceOrder(prev => ({ ...prev, [el.id]: newOrder }));
                                                                        setSequenceChecker(prev => ({ ...prev, [el.id]: null })); // Reset check on change
                                                                    }
                                                                }}
                                                                className="space-y-3"
                                                            >
                                                                {sequenceOrder[el.id].map((step) => (
                                                                    <Reorder.Item
                                                                        key={step.id}
                                                                        value={step}
                                                                        dragListener={sequenceChecker[el.id] !== true}
                                                                    >
                                                                        <div className={`p-4 rounded-xl border flex items-center gap-4 bg-slate-800/80 backdrop-blur-sm select-none shadow-sm ${sequenceChecker[el.id] === true
                                                                            ? 'border-green-500/50 bg-green-500/10'
                                                                            : sequenceChecker[el.id] === false
                                                                                ? 'border-rose-500/50'
                                                                                : 'border-white/10'
                                                                            }`}>
                                                                            <div className="text-slate-500 cursor-grab active:cursor-grabbing">
                                                                                <GripVertical className="w-5 h-5" />
                                                                            </div>
                                                                            <span className="flex-1 text-sm font-medium text-slate-200">{step.text}</span>
                                                                        </div>
                                                                    </Reorder.Item>
                                                                ))}
                                                            </Reorder.Group>
                                                        )}

                                                        <div className="flex justify-end pt-2">
                                                            <button
                                                                onClick={() => {
                                                                    const currentOrder = sequenceOrder[el.id];
                                                                    const isCorrect = currentOrder.every((step, index) => step.correctOrder === index + 1);
                                                                    setSequenceChecker(prev => ({ ...prev, [el.id]: isCorrect }));

                                                                    if (isCorrect) {
                                                                        // Play Success Sound
                                                                        const audio = new Audio('/sounds/success.mp3'); // Placeholder
                                                                        // audio.play().catch(() => {});
                                                                    } else {
                                                                        // Play Error Sound
                                                                    }
                                                                }}
                                                                disabled={sequenceChecker[el.id] === true}
                                                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${sequenceChecker[el.id] === true
                                                                    ? 'bg-green-500 text-slate-900 shadow-green-500/20 cursor-default'
                                                                    : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                                                                    }`}
                                                            >
                                                                {sequenceChecker[el.id] === true ? (
                                                                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Correct</span>
                                                                ) : 'Check Order'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : el.type === 'split-second' ? (
                                                    <div className="flex flex-col h-full gap-4">
                                                        {/* Top Media Section */}
                                                        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                                            {el.content ? (
                                                                el.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? (
                                                                    <img src={el.content} className="w-full h-full object-cover" alt="Scenario" />
                                                                ) : (
                                                                    <video
                                                                        src={el.content}
                                                                        className="w-full h-full object-cover"
                                                                        autoPlay
                                                                        muted
                                                                        loop
                                                                        playsInline
                                                                    />
                                                                )
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-slate-500">
                                                                    <Video className="w-12 h-12 opacity-50" />
                                                                </div>
                                                            )}

                                                            {/* Result Overlay */}
                                                            {splitResults[el.id] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm ${splitResults[el.id] === 'correct' ? 'text-green-500' : 'text-rose-500'}`}
                                                                >
                                                                    {splitResults[el.id] === 'correct' ? <CheckCircle2 className="w-20 h-20 mb-4" /> : <XCircle className="w-20 h-20 mb-4" />}
                                                                    <h3 className="text-2xl font-black uppercase tracking-widest">{splitResults[el.id] === 'correct' ? 'Excellent' : 'Risk Detected'}</h3>

                                                                    {/* Feedback Text */}
                                                                    <div className="mt-6 max-w-md text-center px-6">
                                                                        <p className="text-white text-lg font-medium">
                                                                            {splitResults[el.id] === 'correct'
                                                                                ? (el.splitOptions?.optionA?.id === el.splitOptions?.correctOptionId
                                                                                    ? el.splitOptions?.optionA?.feedbackText
                                                                                    : el.splitOptions?.optionB?.feedbackText)
                                                                                : (el.splitOptions?.optionA?.id !== el.splitOptions?.correctOptionId
                                                                                    ? el.splitOptions?.optionA?.feedbackText
                                                                                    : el.splitOptions?.optionB?.feedbackText)
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>

                                                        {/* Bottom Decision Buttons */}
                                                        <div className="grid grid-cols-2 gap-4 h-32 sm:h-40">
                                                            <button
                                                                onClick={() => {
                                                                    if (splitResults[el.id]) return;
                                                                    const isCorrect = el.splitOptions?.correctOptionId === 'A';
                                                                    setSplitResults(prev => ({ ...prev, [el.id]: isCorrect ? 'correct' : 'incorrect' }));
                                                                }}
                                                                disabled={!!splitResults[el.id]}
                                                                className={`rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all active:scale-95 shadow-lg ${splitResults[el.id]
                                                                    ? (el.splitOptions?.correctOptionId === 'A' ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-slate-800/50 border-white/5 opacity-50')
                                                                    : 'bg-slate-800 border-white/10 hover:bg-slate-700 hover:border-blue-500/50 text-white'
                                                                    }`}
                                                            >
                                                                <span className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Option A</span>
                                                                <span className="text-base sm:text-xl font-bold text-center leading-tight">{el.splitOptions?.optionA?.text || 'Option A'}</span>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    if (splitResults[el.id]) return;
                                                                    const isCorrect = el.splitOptions?.correctOptionId === 'B';
                                                                    setSplitResults(prev => ({ ...prev, [el.id]: isCorrect ? 'correct' : 'incorrect' }));
                                                                }}
                                                                disabled={!!splitResults[el.id]}
                                                                className={`rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all active:scale-95 shadow-lg ${splitResults[el.id]
                                                                    ? (el.splitOptions?.correctOptionId === 'B' ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-slate-800/50 border-white/5 opacity-50')
                                                                    : 'bg-slate-800 border-white/10 hover:bg-slate-700 hover:border-purple-500/50 text-white'
                                                                    }`}
                                                            >
                                                                <span className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Option B</span>
                                                                <span className="text-base sm:text-xl font-bold text-center leading-tight">{el.splitOptions?.optionB?.text || 'Option B'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : el.type === 'video' ? (
                                                    <div className="w-full rounded-2xl overflow-hidden bg-black flex justify-center shadow-lg border border-white/10" style={{ height: el.style.height ? `${el.style.height * 3}px` : 'auto', minHeight: '180px', maxHeight: '50vh' }}>
                                                        {el.content ? (
                                                            <video
                                                                src={el.content}
                                                                controls
                                                                className="w-full h-full object-contain"
                                                                style={{ opacity: el.style.opacity ?? 1 }}
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-slate-600">
                                                                <Video className="w-12 h-12 mb-2 opacity-50" />
                                                                <span className="text-xs font-bold uppercase tracking-wider">No Video Source</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`leading-relaxed relative ${el.sectionFontSize || getDynamicFontSize(el.content)}`}
                                                        style={{
                                                            color: el.style.color || 'white',
                                                            textAlign: (el.style.textAlign === 'center' ? 'center' : (isRtl ? 'right' : 'left')) as any,
                                                            fontWeight: el.style.fontWeight || 'normal'
                                                        }}>
                                                        {el.audioUrl && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const audio = new Audio(el.audioUrl);
                                                                    audio.volume = voiceVolume;
                                                                    audio.play();
                                                                }}
                                                                className={`float-${isRtl ? 'left' : 'right'} ml-2 mb-1 p-2 rounded-full bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-slate-900 transition-colors inline-flex items-center justify-center`}
                                                                title="Play Narration"
                                                            >
                                                                <Volume2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {el.style.listStyle === 'disc' ? (
                                                            <ul className={`list-disc list-outside space-y-1 ${isRtl ? 'mr-5' : 'ml-5'}`}>
                                                                {el.content.split('\n').filter((line: string) => line.trim() !== '').map((line: string, lIdx: number) => (
                                                                    <li key={lIdx} className={`${isRtl ? 'pr-1' : 'pl-1'}`}>
                                                                        <span>{line}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="whitespace-pre-wrap py-1">{el.content}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                    {/* Extra spacer for scroll bottom */}
                                    <div className="h-20 shrink-0" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls - Fixed at Bottom */}
                    <div className="shrink-0 bg-slate-900/95 backdrop-blur border-t border-white/10 p-3 z-50">
                        <div className="w-full max-w-md mx-auto space-y-3">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                <span>{safeIndex + 1}/{slides.length}</span>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500 transition-all duration-300 rounded-full" style={{ width: `${((safeIndex + 1) / slides.length) * 100}%` }} />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Previous Button (Only from slide 2) */}
                                {safeIndex > 0 && (
                                    <button
                                        onClick={prevSlide}
                                        className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
                                    >
                                        <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
                                    </button>
                                )}

                                <button
                                    onClick={nextSlide}
                                    disabled={!canAdvance}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all active:scale-[0.98] ${canAdvance
                                        ? "bg-teal-500 text-slate-900 hover:bg-teal-400 shadow-[0_4px_15px_rgba(20,184,166,0.3)]"
                                        : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                                        }`}
                                >
                                    {safeIndex === slides.length - 1 ? "Finish" : "Next"}
                                    <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Result Overlay */}
                    <AnimatePresence>
                        {result?.show && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="w-full max-w-xs space-y-8"
                                >
                                    {result.passed ? (
                                        <>
                                            <div className="relative">
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", duration: 0.8 }}
                                                    className="w-24 h-24 bg-teal-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.5)]"
                                                >
                                                    <Trophy className="w-12 h-12 text-slate-900" />
                                                </motion.div>
                                                <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/20" />
                                            </div>

                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Congratulations!</h2>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                    {mode === 'training' ? 'Training Successfully Completed' : 'Assessment Successfully Passed'}
                                                </p>
                                            </div>

                                            {mode === 'test' && result.score !== undefined && (
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Marks Obtained</p>
                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span className="text-5xl font-black italic text-teal-400">{result.score}</span>
                                                        <span className="text-xl font-black text-slate-700 italic">/{totalMarks}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => router.push('/dashboard')}
                                                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest italic transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3"
                                            >
                                                <HomeIcon className="w-5 h-5" />
                                                Back to Dashboard
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <div className="w-24 h-24 bg-rose-500/20 border-2 border-rose-500/50 rounded-full mx-auto flex items-center justify-center">
                                                    <AlertCircle className="w-12 h-12 text-rose-500" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Assessment Failed</h2>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                    You did not reach the required passing marks.
                                                </p>
                                            </div>

                                            {result.score !== undefined && (
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Your Score</p>
                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span className="text-5xl font-black italic text-rose-500">{result.score}</span>
                                                        <span className="text-xl font-black text-slate-700 italic">/{totalMarks}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Pass Marks: {result.passMarks}</p>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => router.push(`/play/${moduleId}?mode=training`)}
                                                    className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-3"
                                                >
                                                    <RefreshCcw className="w-5 h-5" />
                                                    Attend Training Again
                                                </button>
                                                <button
                                                    onClick={() => router.push('/dashboard')}
                                                    className="w-full py-4 text-slate-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all"
                                                >
                                                    Return Home
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* Hidden Audio Player */}
                    <audio
                        ref={audioRef}
                        src={currentAudioUrl || undefined}
                        onLoadedMetadata={(e) => {
                            const duration = e.currentTarget.duration;
                            console.log(`[ModulePlayer] Audio Duration: ${duration}s`);
                            setAudioDuration(duration);
                        }}
                        onEnded={() => setAudioEnded(true)}
                        onError={() => {
                            setAudioFailed(true);
                            setAudioDuration(0);
                        }}
                        className="hidden"
                    />

                    {/* Background Audio */}
                    <audio
                        ref={bgAudioRef}
                        src="/background.mp3"
                        loop
                        className="hidden"
                    />
                </div>
            </div>
        </div >
    );
}
