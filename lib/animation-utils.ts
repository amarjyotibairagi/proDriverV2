import { Variants } from "framer-motion";

type AnimationType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom';

export function getRandomEntryAnimation(delay: number = 0, duration: number = 0.5): Variants {
    // Standardize directly to 'slide-up' (fade in from bottom) for professional, non-overlapping flow
    const baseTransition = {
        duration: duration,
        delay: delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    };

    return {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: baseTransition }
    };
}
