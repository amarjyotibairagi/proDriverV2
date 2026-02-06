"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideData {
    id: string;
    title: string;
}

interface SlideNavigatorProps {
    slides: SlideData[];
    currentIndex: number;
    onSelect: (index: number) => void;
    onReorder: (newSlides: any[]) => void; // Using any[] for now, simpler
    onAdd: () => void;
    onDelete: (index: number) => void;
}

export function SlideNavigator({ slides, currentIndex, onSelect, onReorder, onAdd, onDelete }: SlideNavigatorProps) {

    // Helper for simple button-based reorder (since drag-n-drop might be complex for now)
    const moveSlide = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newSlides = [...slides];
        if (direction === 'up' && index > 0) {
            [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
        } else if (direction === 'down' && index < newSlides.length - 1) {
            [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
        }
        onReorder(newSlides);
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] border-r border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slides</span>
                <button
                    onClick={onAdd}
                    className="p-1.5 bg-teal-500/10 text-teal-400 rounded-md hover:bg-teal-500/20 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                <AnimatePresence initial={false}>
                    {slides.map((slide, index) => (
                        <motion.div
                            key={slide.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => onSelect(index)}
                            className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${index === currentIndex
                                    ? "bg-teal-500/10 border-teal-500/50"
                                    : "bg-white/5 border-transparent hover:bg-white/10"
                                }`}
                        >
                            {/* Number Badge */}
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${index === currentIndex
                                    ? "bg-teal-500 text-slate-900"
                                    : "bg-black/40 text-slate-500"
                                }`}>
                                {index + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-xs font-medium truncate ${index === currentIndex ? "text-teal-400" : "text-slate-300"
                                    }`}>
                                    {slide.title || "Untitled Slide"}
                                </h4>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/80 rounded-lg p-1 backdrop-blur-sm">
                                <button
                                    onClick={(e) => moveSlide(index, 'up', e)}
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button
                                    onClick={(e) => moveSlide(index, 'down', e)}
                                    disabled={index === slides.length - 1}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className="w-px h-3 bg-white/20 mx-0.5" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                    className="p-1 text-slate-400 hover:text-red-400"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
