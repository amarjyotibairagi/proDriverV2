"use client";

import { useState } from "react";
import { Upload, X, Check, Loader2, Image as ImageIcon, Grid } from "lucide-react";
import { getPresignedUrlAction, uploadModuleAssetAction } from "@/app/actions/module-editor";
import { ICON_MAP, IconRenderer } from "./icon-mapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploaderProps {
    currentUrl?: string;
    onUpload: (url: string) => void;
    currentColor?: string;
    onColorChange?: (color: string) => void;
    context?: {
        moduleId: string | number;
        mode: 'training' | 'test';
        slideId?: string;
    };
}

export function ImageUploader({ currentUrl, onUpload, currentColor, onColorChange, context }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [mode, setMode] = useState<"upload" | "icon">(currentUrl?.startsWith("icon:") ? "icon" : "upload");

    const handleFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadModuleAssetAction(formData, context);

            if (!res.success || !res.publicUrl) {
                throw new Error(res.error || "Upload failed");
            }

            onUpload(res.publicUrl);
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(error.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Visual Content</label>
                <div className="flex bg-slate-900 rounded p-1 gap-1">
                    <button
                        onClick={() => setMode("upload")}
                        className={`p-1.5 rounded transition-colors ${mode === "upload" ? "bg-teal-500 text-slate-900" : "text-slate-500 hover:text-white"}`}
                        title="Upload Image"
                    >
                        <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setMode("icon")}
                        className={`p-1.5 rounded transition-colors ${mode === "icon" ? "bg-teal-500 text-slate-900" : "text-slate-500 hover:text-white"}`}
                        title="Select Icon"
                    >
                        <Grid className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {mode === "upload" ? (
                // --- UPLOAD MODE ---
                currentUrl && !currentUrl.startsWith("icon:") ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/50">
                        <img src={currentUrl} alt="Asset" className="w-full h-full object-cover" />
                        <button
                            onClick={() => onUpload("")}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div
                        onDragEnter={() => setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        className={`
                        relative h-32 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 group
                        ${dragActive ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                    `}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-teal-400" />
                                </div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                                    {dragActive ? "Drop to upload" : "Drag or Click"}
                                </p>
                            </>
                        )}
                    </div>
                )
            ) : (
                // --- ICON MODE ---
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Icon Grid */}
                    <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                        {Object.keys(ICON_MAP).map((iconName) => (
                            <button
                                key={iconName}
                                onClick={() => onUpload(`icon:${iconName}`)}
                                className={`
                                    p-2 rounded-lg flex items-center justify-center transition-all aspect-square
                                    ${currentUrl === `icon:${iconName}`
                                        ? "bg-teal-500 text-slate-900 ring-2 ring-teal-500/50"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}
                                `}
                                title={iconName}
                            >
                                <IconRenderer name={iconName} className="w-5 h-5" />
                            </button>
                        ))}
                    </div>

                    {/* Color Picker for Icon */}
                    {currentUrl?.startsWith("icon:") && onColorChange && (
                        <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-400">Icon Color</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={currentColor || '#ffffff'}
                                    onChange={(e) => onColorChange(e.target.value)}
                                    className="h-6 w-8 bg-transparent border-none p-0 cursor-pointer"
                                />
                                <span className="text-[10px] font-mono text-slate-500">{currentColor}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
