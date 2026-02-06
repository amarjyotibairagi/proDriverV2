"use client"

import { Suspense, use } from "react"
import { Header } from "@/components/user-dashboard/header"
import { HeroTitle } from "@/components/user-dashboard/hero-title"
import { LoginForm } from "@/components/user-dashboard/login-form"
import { UserDynamicBackground } from "@/components/user-dashboard/dynamic-bg"
import { motion } from "framer-motion"
import { LANGUAGES, translations } from "@/lib/languages"

export default function LoginPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
    const params = use(searchParams)
    const langCode = params.lang || "en"
    const t = translations[langCode] || translations["en"]
    const dir = LANGUAGES.find(l => l.code === langCode)?.dir || 'ltr'

    return (
        <div className="min-h-screen selection:bg-teal-500/30 selection:text-teal-200 text-white overflow-hidden flex flex-col relative" dir={dir}>
            <UserDynamicBackground />

            {/* Header */}
            <div className="relative z-20">
                <Suspense fallback={<div className="h-16" />}>
                    <Header showProfile={false} currentLang={langCode} />
                </Suspense>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 mb-8 sm:mb-12 relative z-10">
                <div className="w-full max-w-md flex flex-col gap-6">
                    {/* Hero Title Section */}
                    <HeroTitle />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-1 flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative group overflow-hidden"
                    >
                        {/* Card Content */}
                        <div className="flex-1 rounded-[2.2rem] bg-gradient-to-br from-white/5 to-transparent relative z-10">
                            <Suspense fallback={
                                <div className="flex flex-col items-center justify-center h-[500px] gap-6">
                                    <div className="w-16 h-16 border-4 border-white/5 border-t-teal-500 rounded-full animate-spin shadow-[0_0_30px_rgba(20,184,166,0.2)]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse italic">{t.btnWait || "Loading..."}</p>
                                </div>
                            }>
                                <LoginForm />
                            </Suspense>
                        </div>

                        {/* Corner Tech Decor */}
                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20" />
                    </motion.div>

                    {/* Security Signature */}
                    <div className="flex items-center justify-center gap-4 opacity-30 mt-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-slate-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 italic text-center">
                            {t.secureConnection || "Secure Connection"}
                        </span>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-slate-500" />
                    </div>
                </div>
            </main>
        </div>
    )
}
