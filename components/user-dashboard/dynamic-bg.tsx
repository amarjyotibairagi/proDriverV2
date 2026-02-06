"use client"

import { motion } from "framer-motion"

export function UserDynamicBackground() {
    return (
        <div className="fixed inset-0 z-0 bg-[#020617] overflow-hidden pointer-events-none">
            {/* Deep Ambient Base */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#0d3d38_0%,_#020617_100%)] opacity-40" />

            {/* Orbital Glow - Primary (Teal) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[120px]"
            />

            {/* Orbital Glow - Secondary (Gold) */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.05, 0.15, 0.05],
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/20 blur-[100px]"
            />

            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

            {/* Digital Grain/Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(0,0,0,0.4)_100%)] z-30" />
        </div>
    )
}
