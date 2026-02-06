"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES } from "@/lib/languages";
import { getAudioConfig } from "@/app/actions/module-editor";
import { SlideData, SlideElement } from "@/app/admin/modules/provision/types";
import { IconRenderer } from "./icon-mapper";
import { getRandomEntryAnimation } from "@/lib/animation-utils";

interface MobileSimulatorProps {
    data: any;
    slides: any[];
    mode: 'training' | 'test';
    currentIndex: number;
    onIndexChange: (index: number) => void;
    pathPrefix?: string;
}

export function MobileSimulator({ data, slides, mode, currentIndex, onIndexChange, pathPrefix = "" }: MobileSimulatorProps) {
    const translations = (data?.content as any)?.translations || {};

    const [selectedLang, setSelectedLang] = useState("en");
    const [r2Domain, setR2Domain] = useState<string>("");

    // Player State
    const [isPlayerLoading, setIsPlayerLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioEnded, setAudioEnded] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [animationsDone, setAnimationsDone] = useState(false);
    const [quizSelections, setQuizSelections] = useState<Record<string, string>>({});
    const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

    // Audio Ref
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        getAudioConfig().then(res => {
            if (res.success && res.r2Domain) {
                setR2Domain(res.r2Domain);
            }
        });
    }, []);

    // Ensure index is valid for render
    const safeIndex = (currentIndex >= slides.length && slides.length > 0) ? 0 : currentIndex;

    const nextSlide = () => {
        if (safeIndex < slides.length - 1) {
            setAudioEnded(false);
            setAudioFailed(false);
            setAnimationsDone(false);
            setQuizSelections({});
            setQuizResults({});
            onIndexChange(safeIndex + 1);
        }
    }

    const prevSlide = () => {
        if (safeIndex > 0) {
            setAudioEnded(false);
            setAnimationsDone(false);
            onIndexChange(safeIndex - 1);
        }
    }

    const startPreview = () => {
        if (isPlaying || isPlayerLoading) {
            setHasStarted(false);
            setIsPlaying(false);
            setIsPlayerLoading(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            setIsPlaying(true);
            setIsPlayerLoading(true);
            setHasStarted(false);
            setQuizSelections({});
            setTimeout(() => {
                setIsPlayerLoading(false);
            }, 1000);
        }
    };

    const handleUserStart = () => {
        setHasStarted(true);
        setIsPlaying(true);
    };

    // Resolve Content
    const sourceSlide = slides[safeIndex];
    let activeContent = {
        title: sourceSlide?.title || "Untitled Slide",
        content: sourceSlide?.content || "No content available.",
        image_url: sourceSlide?.image_url || "",
        audio_url: ""
    };

    if (sourceSlide && selectedLang !== "en") {
        const trans = translations[selectedLang]?.[sourceSlide.id];
        if (trans) {
            activeContent.title = trans.title || activeContent.title;
            activeContent.content = trans.content || activeContent.content;
        }
    }

    // Resolve Audio URL - MATCHING USER SPEC
    const getAudioUrl = () => {
        if (!r2Domain) return null;
        if (!sourceSlide) return null;
        const moduleId = data.id || "new";
        const slideIndex = safeIndex + 1;
        const langCode = selectedLang.toUpperCase();
        // Path: <r2>/[pathPrefix]<moduleId>/<mode>/audio/<slide no>_<language>.mp3
        return `${r2Domain}/${pathPrefix}${moduleId}/${mode}/audio/${slideIndex}_${langCode}.mp3`;
    };

    const currentAudioUrl = getAudioUrl();
    const availableLangs = Array.from(new Set(["en", ...Object.keys(translations)]));

    const currentLangObj = LANGUAGES.find(l => l.code === selectedLang);
    const dir = currentLangObj?.dir || 'ltr';

    // Resolve Elements with Translations
    const elementsWithTranslations = useMemo(() => {
        if (!sourceSlide) return [];

        // DEBUG: Log translation lookup
        console.log('[Translation Debug]', {
            selectedLang,
            slideId: sourceSlide.id,
            translationKeys: Object.keys(translations),
            langDataKeys: translations[selectedLang] ? Object.keys(translations[selectedLang]) : 'N/A',
            fullTranslations: translations
        });

        // Check multiple possible translation structures
        let translationData = null;
        if (selectedLang !== 'en' && translations[selectedLang]) {
            const langData = translations[selectedLang];
            console.log('[Translation Debug] langData:', langData);

            // Check if it's nested under 'slides' or direct by slideId
            if (langData.slides && langData.slides[sourceSlide.id]) {
                translationData = langData.slides[sourceSlide.id];
                console.log('[Translation Debug] Found via langData.slides[slideId]');
            } else if (langData[sourceSlide.id]) {
                translationData = langData[sourceSlide.id];
                console.log('[Translation Debug] Found via langData[slideId]');
                console.log('[Translation Debug] translationData keys:', Object.keys(translationData));
                console.log('[Translation Debug] translationData:', JSON.stringify(translationData, null, 2));
            } else {
                // Try string conversion if ID types mismatch
                const stringId = String(sourceSlide.id);
                if (langData[stringId]) {
                    translationData = langData[stringId];
                    console.log('[Translation Debug] Found via string ID conversion');
                }
            }
        }

        const fullTranslatedText = translationData?.content || null;
        console.log('[Translation Debug] fullTranslatedText:', fullTranslatedText);

        // If there is no translation or it's English, just return original elements
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

    const elementAnimations = useMemo(() => {
        if (!sourceSlide?.elements) return [];
        return sourceSlide.elements.map((_: any, idx: number) => {
            return getRandomEntryAnimation(idx * 0.5, 0.5);
        });
    }, [sourceSlide?.elements]);

    useEffect(() => {
        if (hasStarted && sourceSlide?.elements) {
            const totalDuration = (sourceSlide.elements.length * 0.5) + 0.5;
            const timer = setTimeout(() => {
                setAnimationsDone(true);
            }, totalDuration * 1000);
            return () => clearTimeout(timer);
        } else {
            setAnimationsDone(true);
        }
    }, [hasStarted, sourceSlide]);

    useEffect(() => {
        if (hasStarted && isPlaying && audioRef.current && currentAudioUrl) {
            setAudioEnded(false);
            const timer = setTimeout(() => {
                const playPromise = audioRef.current?.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Auto-play prevented:", error);
                    });
                }
            }, 500);

            return () => {
                clearTimeout(timer);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            };
        }
    }, [safeIndex, currentAudioUrl, isPlaying, hasStarted]);

    const allQuizzesAnswered = useMemo(() => {
        const quizzes = elementsWithTranslations.filter((el: SlideElement) => el.type === 'quiz');
        if (quizzes.length === 0) return true;
        return quizzes.every((q: SlideElement) => quizSelections[q.id]);
    }, [elementsWithTranslations, quizSelections]);

    const canAdvance = (audioEnded || audioFailed) && animationsDone && (mode === 'training' || allQuizzesAnswered);

    const handleSelectChoice = (elId: string, optId: string, quizEl: SlideElement) => {
        if (!isPlaying) return; // Only interactive during preview
        if (quizSelections[elId]) return; // Already answered, no changes

        setQuizSelections(prev => ({
            ...prev,
            [elId]: optId
        }));

        // Check if answer is correct
        const correctOption = (quizEl.quizOptions || []).find(opt => opt.isCorrect);
        const isCorrect = correctOption?.id === optId;
        setQuizResults(prev => ({
            ...prev,
            [elId]: isCorrect
        }));
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="relative w-[360px] h-[720px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden flex flex-col transform scale-90 origin-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20" />
                    <div className="h-8 bg-black flex items-center justify-between px-6 text-[10px] font-medium text-white select-none">
                        <span>9:41</span>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white" />
                        </div>
                    </div>

                    <div className="flex-1 bg-[#020617] text-slate-100 relative overflow-hidden">
                        {isPlayerLoading && (
                            <div className="absolute inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center gap-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full"
                                />
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                    className="text-xs font-bold text-teal-400 uppercase tracking-widest"
                                >
                                    Loading Module...
                                </motion.p>
                            </div>
                        )}

                        {!isPlayerLoading && !hasStarted && isPlaying && (
                            <div className="absolute inset-0 z-40 bg-[#020617]/90 backdrop-blur-sm flex items-center justify-center">
                                <motion.button
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUserStart}
                                    className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.5)] group"
                                >
                                    <Play className="w-10 h-10 text-slate-900 fill-current ml-1 group-hover:scale-110 transition-transform" />
                                </motion.button>
                            </div>
                        )}

                        {sourceSlide ? (
                            <AnimatePresence mode="wait">
                                {(hasStarted || !isPlaying) && (
                                    <motion.div
                                        key={safeIndex}
                                        dir={dir}
                                        className="absolute inset-0 w-full h-full flex flex-col p-4 overflow-y-auto custom-scrollbar"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="absolute inset-0 pointer-events-none" />
                                        {elementsWithTranslations.map((el: SlideElement, idx: number) => {
                                            const variants = isPlaying ? elementAnimations[idx] : { hidden: { opacity: 1 }, visible: { opacity: 1 } };
                                            const displayContent = el.content;

                                            return (
                                                <motion.div
                                                    key={el.id}
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={variants}
                                                    style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: el.type === 'image' ? `${el.style.height || 30}%` : 'auto',
                                                        zIndex: 1,
                                                        alignSelf: 'center'
                                                    }}
                                                    className={`flex-shrink-0 ${el.type === 'image' ? 'py-1' : 'px-4 py-2'}`}
                                                >
                                                    {el.type === 'image' ? (
                                                        <div className={`w-full h-full overflow-hidden rounded-lg shadow-sm flex items-center justify-center ${el.content ? '' : 'bg-slate-900/50'}`}>
                                                            {el.content ? (
                                                                el.content.startsWith('icon:') ? (
                                                                    <IconRenderer
                                                                        name={el.content}
                                                                        className="w-full h-full object-contain p-2"
                                                                        style={{ color: el.style.color || '#ffffff', opacity: el.style.opacity ?? 1 }}
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={el.content}
                                                                        alt="Visual"
                                                                        className="w-full h-full object-contain"
                                                                        style={{ opacity: el.style.opacity ?? 1 }}
                                                                    />
                                                                )
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center text-slate-600">
                                                                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : el.type === 'quiz' ? (
                                                        <div className="w-full space-y-4 px-4 py-2">
                                                            {/* Question */}
                                                            <div className="text-sm font-bold text-white leading-relaxed">
                                                                {displayContent}
                                                            </div>
                                                            {/* Feedback after answering */}
                                                            {quizResults[el.id] !== undefined && (
                                                                <div className={`text-xs font-bold px-3 py-2 rounded-lg ${quizResults[el.id] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                    {quizResults[el.id] ? '✓ Correct!' : '✗ Incorrect'}
                                                                </div>
                                                            )}
                                                            {/* Options */}
                                                            <div className="space-y-2">
                                                                {(el.quizOptions || []).map((opt) => {
                                                                    const isSelected = quizSelections[el.id] === opt.id;
                                                                    const hasAnswered = quizResults[el.id] !== undefined;
                                                                    const isCorrectOption = opt.isCorrect;

                                                                    // Determine styling based on answer state
                                                                    let buttonClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
                                                                    if (hasAnswered) {
                                                                        if (isCorrectOption) {
                                                                            buttonClass = "bg-green-500/20 border-green-500 text-green-100";
                                                                        } else if (isSelected && !isCorrectOption) {
                                                                            buttonClass = "bg-red-500/20 border-red-500 text-red-100";
                                                                        } else {
                                                                            buttonClass = "bg-white/5 border-white/10 text-slate-500 opacity-60";
                                                                        }
                                                                    } else if (isSelected) {
                                                                        buttonClass = "bg-teal-500/20 border-teal-500 text-teal-100";
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={opt.id}
                                                                            onClick={() => handleSelectChoice(el.id, opt.id, el)}
                                                                            disabled={hasAnswered}
                                                                            className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 text-left ${buttonClass} ${hasAnswered ? 'cursor-default' : ''}`}
                                                                        >
                                                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${hasAnswered && isCorrectOption ? "border-green-500" :
                                                                                hasAnswered && isSelected && !isCorrectOption ? "border-red-500" :
                                                                                    isSelected ? "border-teal-500" : "border-slate-700"
                                                                                }`}>
                                                                                {(isSelected || (hasAnswered && isCorrectOption)) && (
                                                                                    <div className={`w-2.5 h-2.5 rounded-full ${hasAnswered && isCorrectOption ? "bg-green-500" :
                                                                                        hasAnswered && isSelected ? "bg-red-500" : "bg-teal-500"
                                                                                        }`} />
                                                                                )}
                                                                            </div>
                                                                            <span className="text-xs">{opt.text}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full text-slate-100" style={{
                                                            fontSize: `${el.style.fontSize ?? 16}px`,
                                                            fontWeight: el.style.fontWeight || 'normal',
                                                            fontStyle: el.style.fontStyle || 'normal',
                                                            color: el.style.color || '#ffffff',
                                                            textAlign: el.style.textAlign || 'left',
                                                        }}>
                                                            {el.style.listStyle === 'disc' ? (
                                                                <ul className="list-disc list-outside ml-5 space-y-1">
                                                                    {displayContent.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                                                        <li key={idx} className="pl-1">
                                                                            <span>{line}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="whitespace-pre-wrap">{displayContent}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}

                                        <div className="flex-1" />

                                        {canAdvance && isPlaying && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={safeIndex === slides.length - 1 ? startPreview : nextSlide}
                                                className="self-center mt-4 mb-8 px-8 py-3 bg-teal-500 rounded-full text-slate-900 font-bold uppercase tracking-widest shadow-lg shadow-teal-500/20 flex items-center gap-2 relative z-50 pointer-events-auto hover:bg-teal-400 transition-colors"
                                            >
                                                <span>{safeIndex === slides.length - 1 ? "Finish" : "Next"}</span>
                                                {safeIndex === slides.length - 1 ? (
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-slate-900 rounded-full" />
                                                    </div>
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 text-center text-slate-500">
                                <p>No slides in this section.</p>
                            </div>
                        )}

                        <audio
                            ref={audioRef}
                            src={currentAudioUrl || undefined}
                            className="hidden"
                            onEnded={() => setAudioEnded(true)}
                            onError={() => {
                                console.warn("Audio failed to load:", currentAudioUrl);
                                setAudioFailed(true);
                            }}
                        />
                    </div>

                    {!isPlaying && (
                        <div className="h-16 bg-[#020617] border-t border-white/10 flex items-center justify-between px-6 z-10">
                            <button
                                onClick={prevSlide}
                                disabled={safeIndex === 0}
                                className="p-2 text-slate-500 hover:text-teal-400 disabled:opacity-20 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-xs font-bold text-slate-500">
                                {slides.length > 0 ? `${safeIndex + 1} / ${slides.length}` : "0 / 0"}
                            </span>
                            <button
                                onClick={nextSlide}
                                disabled={safeIndex === slides.length - 1}
                                className="p-2 text-slate-500 hover:text-teal-400 disabled:opacity-20 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    <div className="h-6 bg-transparent flex justify-center items-end pb-2">
                        <div className="w-32 h-1 bg-white/10 rounded-full" />
                    </div>
                </div>

                <div className="absolute top-8 -right-6 translate-x-full flex flex-col items-center gap-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-2 border-b border-white/5 flex justify-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Lang</span>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            {availableLangs.map(code => (
                                <button
                                    key={code}
                                    onClick={() => {
                                        setSelectedLang(code);
                                        setHasStarted(false);
                                        setIsPlaying(false);
                                    }}
                                    className={`w-full px-3 py-2 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${selectedLang === code
                                        ? "bg-teal-500/20 text-teal-400"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        }`}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startPreview}
                        className="group flex flex-col items-center gap-2"
                        title="Start Preview"
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 transition-all transform group-hover:scale-110 ${isPlaying || isPlayerLoading ? "bg-red-500 hover:bg-red-400" : "bg-teal-500 hover:bg-teal-400"
                            }`}>
                            {isPlaying || isPlayerLoading ? (
                                <div className="w-4 h-4 bg-slate-900 rounded-sm" />
                            ) : (
                                <Play className="w-6 h-6 text-slate-900 fill-current ml-1" />
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-teal-400 transition-colors">
                            {isPlaying || isPlayerLoading ? "Stop" : "Preview"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
