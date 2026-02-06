"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, ShieldCheck } from "lucide-react"

export function ComingSoon() {
    return (
        <div className="relative h-[600px] flex items-center justify-center glass-card rounded-[3rem] border border-white/5 overflow-hidden group">

            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-teal-500/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-500/20 blur-[120px] rounded-full"
                />
            </div>

            {/* Content Section */}
            <div className="relative text-center px-6">

                {/* Floating Icons */}
                <div className="flex justify-center gap-6 mb-8">
                    {[Sparkles, Zap, ShieldCheck].map((Icon, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 0 }}
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 3 + idx, repeat: Infinity, ease: "easeInOut" }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                        >
                            <Icon className={`w-6 h-6 ${idx === 1 ? 'text-amber-400' : 'text-teal-400'}`} />
                        </motion.div>
                    ))}
                </div>

                {/* Animated Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none uppercase italic">
                        Coming<br />Soon
                    </h2>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent my-6"
                    />

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                        Forging the future of modular training architecture. Get ready for seamless integration.
                    </p>
                </motion.div>

                {/* Outline Border Animation */}
                <div className="absolute -inset-[2px] rounded-[3rem] border border-white/10 group-hover:border-teal-500/30 transition-colors duration-500 pointer-events-none" />
            </div>

            {/* Ambient Pulsing Glow */}
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
            />
        </div>
    )
}
