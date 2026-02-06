"use client";

import { useState } from "react";
import { Mic, Play, Loader2, Volume2 } from "lucide-react";
import { generateAudioAssets } from "@/app/actions/module-editor";

interface AudioGeneratorProps {
    text: string;
    onAudioGenerated: (url: string) => void;
    currentAudioUrl?: string;
}

export function AudioGenerator({ text, onAudioGenerated, currentAudioUrl }: AudioGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedLang, setSelectedLang] = useState("en");

    const handleGenerate = async () => {
        if (!text) return;
        setIsGenerating(true);

        try {
            const { success, url, error } = await generateAudioAssets(text, selectedLang);

            if (success && url) {
                onAudioGenerated(url);
            } else {
                toast.error(error || "Generation failed");
            }
        } catch (e) {
            console.error("Audio generation error", e);
            toast.error("Audio generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePlay = () => {
        if (!currentAudioUrl) return;
        const audio = new Audio(currentAudioUrl);
        setIsPlaying(true);
        audio.play();
        audio.onended = () => setIsPlaying(false);
    }

    const LANGUAGES = [
        { code: "en", label: "English" },
        { code: "ar", label: "Arabic" },
        { code: "hi", label: "Hindi" },
        { code: "ur", label: "Urdu" },
        { code: "ml", label: "Malayalam" },
        { code: "ta", label: "Tamil" },
        { code: "te", label: "Telugu" },
        { code: "kn", label: "Kannada" },
        { code: "bn", label: "Bengali" },
        { code: "ps", label: "Pashto" },
        { code: "si", label: "Sinhala" },
        { code: "or", label: "Odia" },
        { code: "ne", label: "Nepali" },
        { code: "tl", label: "Tagalog" },
        { code: "ro", label: "Romanian" },
    ];

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-amber-500" />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audio Narration</h4>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-500 truncate">{currentAudioUrl ? "Asset Ready" : "Not generated"}</p>
                    {!currentAudioUrl && (
                        <select
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="bg-black/20 text-[10px] text-slate-300 border border-white/10 rounded px-1 py-0.5 outline-none focus:border-amber-500/50"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {currentAudioUrl ? (
                <button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="p-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors"
                    title="Play Audio"
                >
                    {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                </button>
            ) : (
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !text}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
                </button>
            )}
        </div>
    );
}
// Import toast
import { toast } from "sonner";
