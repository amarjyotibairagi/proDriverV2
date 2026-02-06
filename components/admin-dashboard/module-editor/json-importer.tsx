"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface JsonImporterProps {
    onImport: (data: any) => void;
    currentData: any;
}

export function JsonImporter({ onImport, currentData }: JsonImporterProps) {
    const [jsonText, setJsonText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onImport(parsed);
            setError(null);
            setJsonText(""); // Clear after successful import
        } catch (e) {
            setError("Invalid JSON format");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
    }

    return (
        <div className="p-6 space-y-4">


            <div className="relative">
                <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder="Paste ChatGPT output here..."
                    className="w-full h-32 bg-[#020617] border border-white/10 rounded-xl p-4 text-xs font-mono text-teal-200/80 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none custom-scrollbar"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    {error && <span className="text-red-400 text-xs font-medium">{error}</span>}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleImport}
                        disabled={!jsonText}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-teal-500/20"
                    >
                        <Upload className="w-3 h-3" />
                        Import
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
