"use client"

import { useState } from "react"
import { Check, Globe, ChevronRight } from "lucide-react"
import { LANGUAGES, translations } from "@/lib/languages"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function LanguageSelector() {
    const router = useRouter()
    const [selectedLang, setSelectedLang] = useState<string | null>(null)
    const [isNavigating, setIsNavigating] = useState(false)

    // Default to 'en' for the selector itself if nothing selected, 
    // but the labels inside the buttons are fixed (lang.name)
    const t = translations['en']

    const handleNext = () => {
        if (selectedLang) {
            setIsNavigating(true)
            router.push(`/login?lang=${selectedLang}`)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Language Grid */}
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                {LANGUAGES.map((lang, idx) => (
                    <motion.button
                        key={lang.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`w-full group relative flex items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 overflow-hidden ${selectedLang === lang.code
                            ? "bg-teal-500/20 border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                            : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                    >
                        {/* Status Light */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${selectedLang === lang.code ? 'bg-teal-500' : 'bg-transparent'}`} />

                        <div className="relative z-10 w-full flex items-center justify-center min-h-[40px]">
                            <div className={`absolute left-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${selectedLang === lang.code ? 'bg-teal-500 text-slate-950 scale-110 rotate-3' : 'bg-slate-900 border border-white/10 text-slate-400 group-hover:text-teal-400'}`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <span className={`text-3xl font-black uppercase italic tracking-tighter ${selectedLang === lang.code ? 'text-white' : 'text-slate-300'}`}>{lang.name}</span>
                        </div>

                        {/* Check Indicator */}
                        <AnimatePresence>
                            {selectedLang === lang.code && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute right-4 z-10 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-lg"
                                >
                                    <Check className="w-5 h-5 text-slate-950 stroke-[3px]" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Animated Hover Background */}
                        {!selectedLang && (
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Proceed Button */}
            <div className="flex flex-col items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    disabled={!selectedLang || isNavigating}
                    className={`w-full group relative overflow-hidden py-5 rounded-[2rem] font-black text-sm tracking-[0.5em] uppercase transition-all duration-500 ${selectedLang
                        ? "bg-slate-100 text-slate-950 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                        : "bg-white/5 text-slate-700 border border-white/5 cursor-not-allowed opacity-50"
                        }`}
                >
                    <div className="relative z-10 flex items-center justify-center gap-3 italic">
                        {isNavigating ? (t.btnWait || "Loading...") : (t.next || "NEXT")}
                        {!isNavigating && selectedLang && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </div>

                    {/* Button Aesthetic Fill */}
                    {selectedLang && (
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                </motion.button>

                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                    {t.selectLanguageToContinue || "Please select a language to continue"}
                </p>
            </div>
        </div >
    )
}
