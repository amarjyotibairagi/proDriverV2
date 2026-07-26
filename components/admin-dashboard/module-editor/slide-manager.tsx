"use client";

import { useState } from "react";
import { SlideData, SlideElement, ElementType, SequenceStep, ImageSliderSlide } from "@/app/admin/modules/provision/types";
import { MediaUploader } from "./media-uploader";
import {
    Plus, Trash2, GripVertical, Type, Image as ImageIcon, Video, HelpCircle, Save, Copy, Square,
    ListOrdered, Zap, Images, Layers, Settings2, ArrowUp, ArrowDown, CheckCircle2, Circle,
    Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, AlignJustify
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
                width: type === 'video' ? 50 : 100,
                height: type === 'image' ? 30 : (type === 'quiz' ? 60 : (type === 'video' ? 30 : 30)),
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

        if (type === 'image-slider') {
            newElement.sliderSlides = [];
            newElement.style.width = 80;
            newElement.style.height = 60;
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
    const moveElement = (index: number, direction: 'up' | 'down') => {
        if (!slide.elements) return;
        const newElements = [...slide.elements];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newElements.length) {
            const [moved] = newElements.splice(index, 1);
            newElements.splice(newIndex, 0, moved);
            onUpdate({ ...slide, elements: newElements });

            // Stay focused on the moved element
            if (selectedElementId === moved.id) {
                // Already selected
            }
        }
    };

    const handleLayerChange = (dir: 'up' | 'down') => {
        if (!activeElement || !slide.elements) return;
        const currentIndex = slide.elements.findIndex(el => el.id === activeElement.id);
        if (currentIndex === -1) return;
        moveElement(currentIndex, dir);
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
                            <button onClick={() => addElement('video')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition-colors">
                                <Video className="w-3 h-3" /> Add Video
                            </button>
                            {moduleType === 'TEST' && (
                                <button onClick={() => addElement('quiz')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded transition-colors">
                                    <HelpCircle className="w-3 h-3" /> Add Quiz
                                </button>
                            )}
                            <button onClick={() => addElement('image-slider')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold rounded transition-colors">
                                <Images className="w-3 h-3" /> Image Slider
                            </button>
                            <button onClick={() => addElement('sequence-sorter')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-colors">
                                <ListOrdered className="w-3 h-3" /> Sequence Sorter
                            </button>
                            <button onClick={() => addElement('split-second')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded transition-colors">
                                <Zap className="w-3 h-3" /> Split Second
                            </button>
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
                                    {el.type === 'text' && <Type className="w-3.5 h-3.5" />}
                                    {el.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5 text-amber-500" />}
                                    {el.type === 'video' && <Video className="w-3.5 h-3.5 text-indigo-400" />}
                                    {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                                    {el.type === 'image-slider' && <Images size={12} />}
                                    {el.type === 'video' && <Video size={12} />}
                                    {el.type === 'quiz' && <HelpCircle size={12} />}
                                    <span className="truncate max-w-[150px]">{el.content ? (el.content.length > 20 ? el.content.substring(0, 20) + '...' : el.content) : (el.type === 'image' ? 'Image' : (el.type === 'video' ? 'Video' : (el.type === 'image-slider' ? 'Image Slider' : (el.type === 'split-second' ? 'Split Second' : 'New Quiz'))))}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveElement(i, 'up'); }}
                                        disabled={i === 0}
                                        className={`p-1 rounded transition-colors ${i === 0 ? 'text-slate-800' : 'text-slate-600 hover:text-teal-400 hover:bg-white/5'}`}
                                        title="Move Up"
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveElement(i, 'down'); }}
                                        disabled={i === (slide.elements?.length || 0) - 1}
                                        className={`p-1 rounded transition-colors ${i === (slide.elements?.length || 0) - 1 ? 'text-slate-800' : 'text-slate-600 hover:text-teal-400 hover:bg-white/5'}`}
                                        title="Move Down"
                                    >
                                        <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="text-slate-600 hover:text-red-400 p-1 ml-1">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
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
                                <div className="space-y-6">
                                    <MediaUploader
                                        type={activeElement.type === 'video' ? 'video' : 'image'}
                                        accept={activeElement.type === 'video' ? "video/*" : "image/*"}
                                        currentUrl={activeElement.content}
                                        onUpload={(url) => updateElement(activeElement.id, { content: url })}
                                        currentColor={activeElement.style.color}
                                        onColorChange={(color) => updateElement(activeElement.id, { color })}
                                        context={moduleId ? {
                                            moduleId: moduleId,
                                            mode: moduleType === 'TEST' ? 'test' : 'training',
                                            slideId: slideIndex ? `${slideIndex}_${activeElement.id}` : activeElement.id
                                        } : undefined}
                                        label={activeElement.type === 'video' ? "Video Source" : "Visual Content"}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Hazard Hunter Editor */}
                        {/* Image Slider Editor */}
                        {activeElement.type === 'image-slider' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slides</label>
                                    <p className="text-[10px] text-slate-500">Upload images and add descriptions for each slide.</p>

                                    <div className="space-y-4">
                                        {(activeElement.sliderSlides || []).map((slide, idx) => (
                                            <div key={slide.id} className="p-3 bg-slate-800 rounded-lg border border-white/5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono text-orange-400">Slide {idx + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newSlides = activeElement.sliderSlides?.filter(s => s.id !== slide.id);
                                                            updateElement(activeElement.id, { sliderSlides: newSlides });
                                                        }}
                                                        className="text-slate-500 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <MediaUploader
                                                    type="image"
                                                    accept="image/*"
                                                    currentUrl={slide.imageUrl}
                                                    onUpload={(url) => {
                                                        const newSlides = activeElement.sliderSlides?.map(s => s.id === slide.id ? { ...s, imageUrl: url } : s);
                                                        updateElement(activeElement.id, { sliderSlides: newSlides });
                                                    }}
                                                    context={moduleId ? {
                                                        moduleId: moduleId,
                                                        mode: moduleType === 'TEST' ? 'test' : 'training',
                                                        slideId: `${activeElement.id}_slide_${slide.id}`
                                                    } : undefined}
                                                    label="Slide Image"
                                                />

                                                <textarea
                                                    value={slide.description}
                                                    onChange={(e) => {
                                                        const newSlides = activeElement.sliderSlides?.map(s => s.id === slide.id ? { ...s, description: e.target.value } : s);
                                                        updateElement(activeElement.id, { sliderSlides: newSlides });
                                                    }}
                                                    placeholder="Slide description..."
                                                    className="w-full bg-slate-900 border border-white/10 rounded p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                                                    rows={2}
                                                />
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                const newSlide: ImageSliderSlide = {
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    imageUrl: '',
                                                    description: ''
                                                };
                                                updateElement(activeElement.id, {
                                                    sliderSlides: [...(activeElement.sliderSlides || []), newSlide]
                                                });
                                            }}
                                            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-slate-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-3 h-3" /> Add Slide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Sequence Sorter Editor */}
                        {
                            activeElement.type === 'sequence-sorter' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Procedural Steps</label>
                                        <p className="text-[10px] text-slate-500">Add steps in the correct order. They will be randomized for the user.</p>

                                        <div className="space-y-2">
                                            {(activeElement.sequenceSteps || []).map((step, idx) => (
                                                <div key={step.id} className="p-3 bg-slate-800 rounded-lg border border-white/5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-mono text-blue-400">Step {idx + 1}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newSteps = activeElement.sequenceSteps?.filter(s => s.id !== step.id);
                                                                updateElement(activeElement.id, { sequenceSteps: newSteps });
                                                            }}
                                                            className="text-slate-500 hover:text-rose-500"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={step.text}
                                                        onChange={(e) => {
                                                            const newSteps = activeElement.sequenceSteps?.map(s => s.id === step.id ? { ...s, text: e.target.value } : s);
                                                            updateElement(activeElement.id, { sequenceSteps: newSteps });
                                                        }}
                                                        placeholder="Step description..."
                                                        className="w-full bg-slate-900 border border-white/10 rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    const newStep: SequenceStep = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        text: '',
                                                        correctOrder: (activeElement.sequenceSteps?.length || 0) + 1
                                                    };
                                                    updateElement(activeElement.id, {
                                                        sequenceSteps: [...(activeElement.sequenceSteps || []), newStep]
                                                    });
                                                }}
                                                className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-slate-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-3 h-3" /> Add Step
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {/* Split Second Editor */}
                        {
                            activeElement.type === 'split-second' && (
                                <div className="space-y-6">
                                    <MediaUploader
                                        type="video" // Default to video but allow image
                                        accept="video/*,image/*"
                                        currentUrl={activeElement.content}
                                        onUpload={(url) => updateElement(activeElement.id, { content: url })}
                                        context={moduleId ? {
                                            moduleId: moduleId,
                                            mode: moduleType === 'TEST' ? 'test' : 'training',
                                            slideId: slideIndex ? `${slideIndex}_${activeElement.id}` : activeElement.id
                                        } : undefined}
                                        label="Scenario Media (Video/Image)"
                                    />

                                    <div className="space-y-4 border-t border-white/5 pt-4">
                                        <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Decision Options</label>

                                        {/* Option A */}
                                        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${activeElement.splitOptions?.correctOptionId === 'A' ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800 border-white/10'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">Option A</span>
                                                <button
                                                    onClick={() => updateElement(activeElement.id, {
                                                        splitOptions: {
                                                            ...activeElement.splitOptions,
                                                            optionA: activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' },
                                                            optionB: activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' },
                                                            correctOptionId: 'A'
                                                        }
                                                    })}
                                                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${activeElement.splitOptions?.correctOptionId === 'A' ? 'bg-green-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                                >
                                                    {activeElement.splitOptions?.correctOptionId === 'A' ? 'Correct Answer' : 'Mark Correct'}
                                                </button>
                                            </div>
                                            <input
                                                value={activeElement.splitOptions?.optionA?.text || ''}
                                                onChange={(e) => updateElement(activeElement.id, {
                                                    splitOptions: {
                                                        ...activeElement.splitOptions,
                                                        optionA: { ...(activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' }), text: e.target.value },
                                                        optionB: activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' },
                                                        correctOptionId: activeElement.splitOptions?.correctOptionId || 'A'
                                                    }
                                                })}
                                                placeholder="Option A Text (e.g. Brake Hard)"
                                                className="w-full bg-slate-900 border border-white/10 rounded p-2 text-sm text-white focus:border-purple-500/50 outline-none"
                                            />
                                            <textarea
                                                value={activeElement.splitOptions?.optionA?.feedbackText || ''}
                                                onChange={(e) => updateElement(activeElement.id, {
                                                    splitOptions: {
                                                        ...activeElement.splitOptions,
                                                        optionA: { ...(activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' }), feedbackText: e.target.value },
                                                        optionB: activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' },
                                                        correctOptionId: activeElement.splitOptions?.correctOptionId || 'A'
                                                    }
                                                })}
                                                placeholder="Feedback if selected..."
                                                className="w-full bg-black/20 border border-white/5 rounded p-2 text-xs text-slate-300 focus:border-purple-500/30 outline-none"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Option B */}
                                        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${activeElement.splitOptions?.correctOptionId === 'B' ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800 border-white/10'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">Option B</span>
                                                <button
                                                    onClick={() => updateElement(activeElement.id, {
                                                        splitOptions: {
                                                            ...activeElement.splitOptions,
                                                            optionA: activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' },
                                                            optionB: activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' },
                                                            correctOptionId: 'B'
                                                        }
                                                    })}
                                                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${activeElement.splitOptions?.correctOptionId === 'B' ? 'bg-green-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                                >
                                                    {activeElement.splitOptions?.correctOptionId === 'B' ? 'Correct Answer' : 'Mark Correct'}
                                                </button>
                                            </div>
                                            <input
                                                value={activeElement.splitOptions?.optionB?.text || ''}
                                                onChange={(e) => updateElement(activeElement.id, {
                                                    splitOptions: {
                                                        ...activeElement.splitOptions,
                                                        optionA: activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' },
                                                        optionB: { ...(activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' }), text: e.target.value },
                                                        correctOptionId: activeElement.splitOptions?.correctOptionId || 'A'
                                                    }
                                                })}
                                                placeholder="Option B Text (e.g. Swerve Left)"
                                                className="w-full bg-slate-900 border border-white/10 rounded p-2 text-sm text-white focus:border-purple-500/50 outline-none"
                                            />
                                            <textarea
                                                value={activeElement.splitOptions?.optionB?.feedbackText || ''}
                                                onChange={(e) => updateElement(activeElement.id, {
                                                    splitOptions: {
                                                        ...activeElement.splitOptions,
                                                        optionA: activeElement.splitOptions?.optionA || { id: 'A', text: '', feedbackText: '' },
                                                        optionB: { ...(activeElement.splitOptions?.optionB || { id: 'B', text: '', feedbackText: '' }), feedbackText: e.target.value },
                                                        correctOptionId: activeElement.splitOptions?.correctOptionId || 'A'
                                                    }
                                                })}
                                                placeholder="Feedback if selected..."
                                                className="w-full bg-black/20 border border-white/5 rounded p-2 text-xs text-slate-300 focus:border-purple-500/30 outline-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Audio Support for Text and Quiz */}
                        {
                            (activeElement.type === 'text' || activeElement.type === 'quiz') && (
                                <div className="pt-4 border-t border-white/5">
                                    <MediaUploader
                                        type="audio"
                                        accept="audio/*"
                                        currentUrl={activeElement.audioUrl}
                                        onUpload={(url) => updateElement(activeElement.id, { audioUrl: url })}
                                        context={moduleId ? {
                                            moduleId: moduleId,
                                            mode: moduleType === 'TEST' ? 'test' : 'training',
                                            slideId: slideIndex ? `${slideIndex}_${activeElement.id}_audio` : `${activeElement.id}_audio`
                                        } : undefined}
                                        label="Narration / Audio"
                                    />
                                </div>
                            )
                        }

                        {/* Layout Controls - For Image and Video (Height/Width) */}
                        {
                            (activeElement.type === 'image' || activeElement.type === 'video') && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Sizing</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] text-slate-400"><span>Width (%)</span><span>{activeElement.style.width || 100}%</span></div>
                                        <input
                                            type="range" min="10" max="100"
                                            value={activeElement.style.width || 100}
                                            onChange={(e) => updateElement(activeElement.id, { width: parseInt(e.target.value) })}
                                            className="w-full accent-teal-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
                                        />
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
                            )
                        }

                        {/* Styling Controls */}
                        {
                            activeElement.type === 'text' && (
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
                            )
                        }
                    </div >
                )}
            </div >
        </div >
    );
}
