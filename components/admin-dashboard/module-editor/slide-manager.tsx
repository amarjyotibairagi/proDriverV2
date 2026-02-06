"use client";

import { useState } from "react";
import { SlideData, SlideElement, ElementType } from "@/app/admin/modules/provision/types";
import { ImageUploader } from "./image-uploader";
import {
    Type, Image as ImageIcon, Trash2,
    Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Layers, Settings2, Grid3X3, ArrowUp, ArrowDown, List,
    HelpCircle, Plus, CheckCircle2, Circle
} from "lucide-react";

interface SlideEditorProps {
    slide: SlideData | null;
    onUpdate: (updatedSlide: SlideData) => void;
    moduleType?: 'TRAINING' | 'TEST';
    moduleId?: number | string;
    slideIndex?: number;
}

export function SlideEditor({ slide, onUpdate, moduleType = 'TRAINING', moduleId, slideIndex }: SlideEditorProps) {
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    if (!slide) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <p>No slide selected</p>
                <p className="text-xs">Select or add a slide from the left sidebar.</p>
            </div>
        );
    }

    const handleSlideChange = (field: keyof SlideData, value: any) => {
        onUpdate({ ...slide, [field]: value });
    };

    // --- Element Management ---
    const addElement = (type: ElementType) => {
        const newElement: SlideElement = {
            id: `el-${Date.now()}`,
            type,
            content: type === 'text' ? 'New Text Block' : (type === 'quiz' ? 'New Question' : ''),
            style: {
                width: 100,
                height: type === 'image' ? 30 : (type === 'quiz' ? 60 : 30),
                fontSize: 18,
                color: '#ffffff',
                opacity: 1,
                textAlign: 'left',
                rotation: 0,
                backgroundColor: ''
            },
            animation: { type: 'fade-in', delay: (slide.elements?.length || 0) * 0.2, duration: 0.5 }
        };

        if (type === 'quiz') {
            newElement.quizOptions = [
                { id: `opt-${Date.now()}-1`, text: 'Option 1', isCorrect: false },
                { id: `opt-${Date.now()}-2`, text: 'Option 2', isCorrect: true }
            ];
            newElement.marks = 1;
        }

        const elements = [...(slide.elements || []), newElement];
        onUpdate({ ...slide, elements });
        setSelectedElementId(newElement.id);
    };

    const updateElement = (id: string, updates: Partial<SlideElement> | Partial<SlideElement['style']> | any) => {
        if (!slide.elements) return;
        const newElements = slide.elements.map(el => {
            if (el.id !== id) return el;

            // Check for style/animation nested updates
            if ('width' in updates || 'height' in updates || 'fontSize' in updates || 'color' in updates || 'fontWeight' in updates || 'fontStyle' in updates || 'borderRadius' in updates || 'textAlign' in updates || 'rotation' in updates || 'backgroundColor' in updates || 'listStyle' in updates) {
                return { ...el, style: { ...el.style, ...updates } };
            }
            if ('animation' in updates) {
                return { ...el, animation: { ...el.animation, ...updates.animation } };
            }

            return { ...el, ...updates };
        });
        onUpdate({ ...slide, elements: newElements });
    };

    const deleteElement = (id: string) => {
        if (!confirm("Delete this element?")) return;
        const newElements = slide.elements?.filter(el => el.id !== id) || [];
        onUpdate({ ...slide, elements: newElements });
        setSelectedElementId(null);
    };

    const activeElement = slide.elements?.find(el => el.id === selectedElementId);

    // --- Actions ---
    const handleLayerChange = (dir: 'up' | 'down') => {
        if (!activeElement || !slide.elements) return;

        const currentElements = [...slide.elements];
        const currentIndex = currentElements.findIndex(el => el.id === activeElement.id);
        if (currentIndex === -1) return;

        const newIndex = dir === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < currentElements.length) {
            const [movedElement] = currentElements.splice(currentIndex, 1);
            currentElements.splice(newIndex, 0, movedElement);

            onUpdate({ ...slide, elements: currentElements });
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Editor</h2>
                    <div className="h-1 w-20 bg-teal-500 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Visual Canvas Manager */}
                <div className="bg-[#020617] border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-teal-400" />
                            Content Blocks
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => addElement('text')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded transition-colors">
                                <Type className="w-3 h-3" /> Add Text
                            </button>
                            <button onClick={() => addElement('image')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded transition-colors">
                                <ImageIcon className="w-3 h-3" /> Add Image
                            </button>
                            {moduleType === 'TEST' && (
                                <button onClick={() => addElement('quiz')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded transition-colors">
                                    <HelpCircle className="w-3 h-3" /> Add Quiz
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Layer List */}
                    <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                        {!slide.elements?.length && <p className="text-xs text-slate-600 text-center py-4">Canvas is empty.</p>}
                        {(slide.elements || []).map((el, i) => (
                            <div
                                key={el.id}
                                onClick={() => setSelectedElementId(el.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border transition-all ${selectedElementId === el.id ? 'bg-teal-500/20 border-teal-500/50 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-slate-600 text-[10px] w-4">{i + 1}</span>
                                    {el.type === 'text' ? <Type className="w-3.5 h-3.5" /> : (
                                        el.type === 'quiz' ? <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> : <ImageIcon className="w-3.5 h-3.5" />
                                    )}
                                    <span className="truncate max-w-[150px]">{el.content || (el.type === 'image' ? 'Image' : 'New Quiz')}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="text-slate-600 hover:text-red-400 p-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Properties Panel (Only if Selected) */}
                {activeElement && (
                    <div className="bg-[#020617] border border-white/10 rounded-xl p-4 space-y-6 animate-in hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-teal-400" />
                                <span className="text-xs font-bold text-white uppercase">Properties</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleLayerChange('up')} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleLayerChange('down')} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            {activeElement.type === 'text' ? (
                                <textarea
                                    value={activeElement.content}
                                    onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500/50 outline-none min-h-[60px]"
                                    placeholder="Type your text here..."
                                />
                            ) : activeElement.type === 'quiz' ? (
                                <div className="space-y-4">
                                    {/* Question Text */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Question</label>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Marks:</label>
                                                <input
                                                    type="number"
                                                    value={activeElement.marks || 1}
                                                    onChange={(e) => updateElement(activeElement.id, { marks: parseInt(e.target.value) || 0 })}
                                                    className="w-12 bg-slate-900 border border-white/10 rounded text-xs text-white p-1 text-center focus:border-amber-500/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            value={activeElement.content}
                                            onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-amber-500/50 outline-none"
                                            placeholder="Enter Question..."
                                        />
                                    </div>

                                    {/* Options */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Options (Select Correct Answers)</label>
                                        <div className="space-y-2">
                                            {(activeElement.quizOptions || []).map((opt) => (
                                                <div key={opt.id} className="flex items-center gap-2">
                                                    {/* Correct Answer Toggle (Multi-Select) */}
                                                    <button
                                                        onClick={() => {
                                                            const newOptions = activeElement.quizOptions?.map(o => o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o);
                                                            updateElement(activeElement.id, { quizOptions: newOptions });
                                                        }}
                                                        className={`p-1 rounded-full transition-colors ${opt.isCorrect ? 'text-green-500 bg-green-500/10' : 'text-slate-600 hover:text-slate-400'}`}
                                                        title={opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                                                    >
                                                        {opt.isCorrect ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                    </button>

                                                    {/* Option Text */}
                                                    <input
                                                        value={opt.text}
                                                        onChange={(e) => {
                                                            const newOptions = activeElement.quizOptions?.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o);
                                                            updateElement(activeElement.id, { quizOptions: newOptions });
                                                        }}
                                                        className="flex-1 bg-slate-900 border border-white/10 rounded p-2 text-xs text-white focus:border-amber-500/50 outline-none"
                                                        placeholder="Option Text"
                                                    />

                                                    {/* Delete Option */}
                                                    <button
                                                        onClick={() => {
                                                            const newOptions = activeElement.quizOptions?.filter(o => o.id !== opt.id);
                                                            updateElement(activeElement.id, { quizOptions: newOptions });
                                                        }}
                                                        className="p-1.5 text-slate-600 hover:text-red-400"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newOption = { id: `opt-${Date.now()}`, text: '', isCorrect: false };
                                                    const newOptions = [...(activeElement.quizOptions || []), newOption];
                                                    updateElement(activeElement.id, { quizOptions: newOptions });
                                                }}
                                                className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-slate-400 hover:bg-white/5 hover:text-white flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Add Option
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ImageUploader
                                    currentUrl={activeElement.content}
                                    onUpload={(url) => updateElement(activeElement.id, { content: url })}
                                    currentColor={activeElement.style.color}
                                    onColorChange={(color) => updateElement(activeElement.id, { color })}
                                    context={moduleId ? {
                                        moduleId: moduleId,
                                        mode: moduleType === 'TEST' ? 'test' : 'training',
                                        slideId: slideIndex ? `${slideIndex}_${activeElement.id}` : activeElement.id
                                    } : undefined}
                                />
                            )}
                        </div>

                        {/* Layout Controls - Only for Image (Height) */}
                        {activeElement.type === 'image' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Sizing</p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-slate-400"><span>Height (%)</span><span>{activeElement.style.height || 30}%</span></div>
                                    <input
                                        type="range" min="10" max="80"
                                        value={activeElement.style.height || 30}
                                        onChange={(e) => updateElement(activeElement.id, { height: parseInt(e.target.value) })}
                                        className="w-full accent-teal-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Styling Controls */}
                        {activeElement.type === 'text' && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Style</p>

                                <div className="space-y-4">
                                    {/* Font Size Slider */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] text-slate-400"><span>Size</span><span>{activeElement.style.fontSize}px</span></div>
                                        <input
                                            type="range" min="12" max="64" step="2"
                                            value={activeElement.style.fontSize ?? 16}
                                            onChange={(e) => updateElement(activeElement.id, { fontSize: parseInt(e.target.value) })}
                                            className="w-full accent-teal-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex bg-slate-800 rounded-lg p-1">
                                            <button onClick={() => updateElement(activeElement.id, { fontWeight: activeElement.style.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1.5 rounded ${activeElement.style.fontWeight === 'bold' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><Bold size={14} /></button>
                                            <button onClick={() => updateElement(activeElement.id, { fontStyle: activeElement.style.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-1.5 rounded ${activeElement.style.fontStyle === 'italic' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><Italic size={14} /></button>
                                            <button onClick={() => updateElement(activeElement.id, { listStyle: activeElement.style.listStyle === 'disc' ? 'none' : 'disc' })} className={`p-1.5 rounded ${activeElement.style.listStyle === 'disc' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><List size={14} /></button>
                                        </div>
                                        <div className="flex bg-slate-800 rounded-lg p-1">
                                            <button onClick={() => updateElement(activeElement.id, { textAlign: 'left' })} className={`p-1.5 rounded ${!activeElement.style.textAlign || activeElement.style.textAlign === 'left' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><AlignLeft size={14} /></button>
                                            <button onClick={() => updateElement(activeElement.id, { textAlign: 'center' })} className={`p-1.5 rounded ${activeElement.style.textAlign === 'center' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><AlignCenter size={14} /></button>
                                            <button onClick={() => updateElement(activeElement.id, { textAlign: 'right' })} className={`p-1.5 rounded ${activeElement.style.textAlign === 'right' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><AlignRight size={14} /></button>
                                            <button onClick={() => updateElement(activeElement.id, { textAlign: 'justify' })} className={`p-1.5 rounded ${activeElement.style.textAlign === 'justify' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}><AlignJustify size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                                            <span className="text-[10px] text-slate-400">Text Color</span>
                                            <input type="color" value={activeElement.style.color || '#ffffff'} onChange={(e) => updateElement(activeElement.id, { color: e.target.value })} className="h-5 w-6 bg-transparent border-none p-0 cursor-pointer" />
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                                            <span className="text-[10px] text-slate-400">Background</span>
                                            <div className="flex items-center gap-2">
                                                {activeElement.style.backgroundColor && (
                                                    <button onClick={() => updateElement(activeElement.id, { backgroundColor: '' })} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>
                                                )}
                                                <input type="color" value={activeElement.style.backgroundColor || '#000000'} onChange={(e) => updateElement(activeElement.id, { backgroundColor: e.target.value })} className="h-5 w-6 bg-transparent border-none p-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
