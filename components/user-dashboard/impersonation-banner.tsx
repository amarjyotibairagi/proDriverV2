"use client"

import { LogOut, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { exitImpersonation } from "@/app/actions/auth"
import { useRouter } from "next/navigation"

export function ImpersonationBanner() {
    const router = useRouter()

    const handleExit = async () => {
        const res = await exitImpersonation()
        if (res.success) {
            router.push("/admin")
            router.refresh()
        }
    }

    return (
        <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[10000] bg-orange-600 text-white py-2 px-4 shadow-2xl flex items-center justify-center gap-6 border-b border-orange-400/30"
        >
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                    Viewing as Shadow Account (Tester Mode)
                </span>
            </div>

            <button
                onClick={handleExit}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
                <LogOut className="w-3 h-3" />
                Return to Admin Console
            </button>
        </motion.div>
    )
}
