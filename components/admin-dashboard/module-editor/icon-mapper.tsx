import {
    Check, X, AlertCircle, AlertTriangle, Info,
    User, Users, Home, Settings, Search, Bell,
    Calendar, Clock, MapPin, Phone, Mail,
    ArrowRight, ArrowLeft, ChevronRight, ChevronLeft,
    Upload, Download, Trash, Edit, Save, Plus, Minus,
    Star, Heart, ThumbsUp, ThumbsDown,
    Car, Truck, Bus, Shield, Lock, Unlock,
    TrafficCone, Construction, Fuel, Gauge,
    Briefcase, GraduationCap, Award, Zap,
    Activity, Layout, Image as ImageIcon,
    FileText, CheckCircle, XCircle,
    FireExtinguisher, Flame, Droplets, Thermometer,
    Stethoscope, HeartPulse, Siren, Megaphone, Radio,
    HardHat, Glasses, Ear, Eye, EyeOff,
    Skull, Biohazard, Radiation, ZapOff,
    Ban, Cigarette, CigaretteOff,
    LifeBuoy, Anchor, CircleStop, TriangleAlert, OctagonAlert
} from "lucide-react";
import { Copy } from "lucide-react";

export const ICON_MAP: Record<string, any> = {
    "check": Check,
    "check-circle": CheckCircle,
    "x": X,
    "x-circle": XCircle,
    "alert-circle": AlertCircle,
    "alert-triangle": AlertTriangle,
    "info": Info,
    "user": User,
    "users": Users,
    "home": Home,
    "settings": Settings,
    "search": Search,
    "bell": Bell,
    "calendar": Calendar,
    "clock": Clock,
    "map-pin": MapPin,
    "phone": Phone,
    "mail": Mail,
    "arrow-right": ArrowRight,
    "arrow-left": ArrowLeft,
    "chevron-right": ChevronRight,
    "chevron-left": ChevronLeft,
    "upload": Upload,
    "download": Download,
    "trash": Trash,
    "edit": Edit,
    "save": Save,
    "plus": Plus,
    "minus": Minus,
    "star": Star,
    "heart": Heart,
    "thumbs-up": ThumbsUp,
    "thumbs-down": ThumbsDown,
    "car": Car,
    "truck": Truck,
    "bus": Bus,
    "shield": Shield,
    "lock": Lock,
    "unlock": Unlock,
    "traffic-cone": TrafficCone,
    "construction": Construction,
    "fuel": Fuel,
    "gauge": Gauge,
    "briefcase": Briefcase,
    "graduation-cap": GraduationCap,
    "award": Award,
    "zap": Zap,
    "activity": Activity,
    "layout": Layout,
    "image": ImageIcon,
    "file-text": FileText,
    // Health & Safety
    "fire-extinguisher": FireExtinguisher,
    "flame": Flame,
    "fire": Flame,
    "droplets": Droplets,
    "thermometer": Thermometer,
    "stethoscope": Stethoscope,
    "heart-pulse": HeartPulse,
    "siren": Siren,
    "megaphone": Megaphone,
    "radio": Radio,
    "hard-hat": HardHat,
    "glasses": Glasses,
    "ear": Ear,
    "eye": Eye,
    "eye-off": EyeOff,
    "skull": Skull,
    "biohazard": Biohazard,
    "radiation": Radiation,
    "zap-off": ZapOff,
    "ban": Ban,
    "cigarette": Cigarette,
    "cigarette-off": CigaretteOff,
    "life-buoy": LifeBuoy,
    "anchor": Anchor,
    "circle-stop": CircleStop,
    "triangle-alert": TriangleAlert,
    "octagon-alert": OctagonAlert,
};

interface IconRendererProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

export function IconRenderer({ name, className, style }: IconRendererProps) {
    // expecting name like "icon:check" or just "check"
    const iconName = name.startsWith("icon:") ? name.replace("icon:", "") : name;

    // Check if it's a valid icon
    const Icon = ICON_MAP[iconName.toLowerCase()];

    if (!Icon) return null;
    return <Icon className={className} style={style} />;
}
