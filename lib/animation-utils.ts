import { Variants } from "framer-motion";

type AnimationType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom';

export function getRandomEntryAnimation(delay: number = 0, duration: number = 0.5): Variants {
    const types: AnimationType[] = ['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const baseTransition = {
        duration: duration,
        delay: delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number] // Custom easeOut with explicit type
    };

    switch (randomType) {
        case 'slide-left':
            return {
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: baseTransition }
            };
        case 'slide-right':
            return {
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: baseTransition }
            };
        case 'slide-up':
            return {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: baseTransition }
            };
        case 'slide-down':
            return {
                hidden: { opacity: 0, y: -50 },
                visible: { opacity: 1, y: 0, transition: baseTransition }
            };
        case 'zoom':
            return {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: baseTransition }
            };
        case 'fade':
        default:
            return {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: baseTransition }
            };
    }
}
