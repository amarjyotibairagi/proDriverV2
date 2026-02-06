"use client"

import { motion } from "framer-motion"

export function DynamicBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Extremely Subtle Pulsing Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.03, 0.08, 0.03], // Toned down from 0.1-0.15
                    x: [0, 30, 0],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-teal-500/20 rounded-full blur-[150px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.02, 0.05, 0.02], // Toned down
                    x: [0, -50, 0],
                    y: [0, 40, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]"
            />

            {/* Subtle Grid Pattern - Increased visibility slightly for texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.015]" />

            {/* Dark Overlay to ensure base background remains dominant */}
            <div className="absolute inset-0 bg-black/40" />
        </div>
    )
}
