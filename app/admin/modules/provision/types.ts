export type ElementType = 'text' | 'image' | 'quiz';

export interface ElementStyle {
    top?: number; // %
    left?: number; // %
    width: number; // %
    height?: number; // % or auto
    fontSize?: number;
    fontWeight?: string; // 'bold', 'normal'
    fontStyle?: string; // 'italic', 'normal'
    color?: string;
    backgroundColor?: string;
    zIndex?: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    listStyle?: 'none' | 'disc' | 'decimal';
}

export interface ElementAnimation {
    type: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'zoom-in' | 'none';
    delay: number;
    duration: number;
}

export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface SlideElement {
    id: string;
    type: ElementType;
    content: string; // Text content or Image URL
    style: ElementStyle;
    animation?: ElementAnimation;

    // Quiz Specific
    quizOptions?: QuizOption[];
    correctAnswerId?: string; // For single choice (Deprecated, prefer quizOptions.isCorrect)
    marks?: number; // Marks for this question
}

export interface SlideData {
    id: string;
    title: string;
    narration: string; // Spoken text / transcript

    // Canvas Elements
    elements: SlideElement[];

    // Background (optional future proofing, or just basic color/image)
    backgroundImage?: string;
    backgroundColor?: string;

    // Legacy Support (optional, can be removed if we migrate fully on load)
    image_url?: string;
    content?: string; // Old text content
}

export interface ModuleContentSection {
    slides: SlideData[];
}

export interface ModuleContent {
    training: ModuleContentSection;
    assessment: ModuleContentSection;
    translations?: Record<string, Record<string, {
        title?: string;
        content?: string;
        hasAudio?: boolean;
        elements?: SlideElement[]; // Deep translated elements?
    }>>;
}

export interface ModuleData {
    id?: number;
    title: string;
    slug: string;
    description?: string | null;
    type?: 'TRAINING' | 'TEST' | 'TE'; // 'TE' seems to be Training + Exam/Assessment? Or 'TRAINING_AND_TEST'
    isPublished: boolean;
    content: ModuleContent;
    pass_marks?: number;
    total_marks?: number;
    linked_module_id?: number | null;
    created_at?: string;
    updated_at?: string;
}
