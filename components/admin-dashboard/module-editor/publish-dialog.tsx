"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, FileText, Languages, Volume2 } from "lucide-react";
import { verifyCurrentPassword } from "@/app/actions/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PublishDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPublish: () => void;
    moduleData: any;
}

export function PublishDialog({ open, onOpenChange, onPublish, moduleData }: PublishDialogProps) {
    const [step, setStep] = useState<'auth' | 'checking' | 'completed'>('auth');
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = useState(false);

    // Check States
    const [checks, setChecks] = useState({
        slides: { status: 'pending' as 'pending' | 'checking' | 'valid' | 'invalid', label: 'Verifying Slide Content...' },
        translations: { status: 'pending' as 'pending' | 'checking' | 'valid' | 'invalid', label: 'Checking Translations...' },
        audio: { status: 'pending' as 'pending' | 'checking' | 'valid' | 'invalid', label: 'Validating Audio Assets...' }
    });

    const reset = () => {
        setStep('auth');
        setPassword("");
        setChecks({
            slides: { status: 'pending', label: 'Verifying Slide Content...' },
            translations: { status: 'pending', label: 'Checking Translations...' },
            audio: { status: 'pending', label: 'Validating Audio Assets...' }
        });
    };

    useEffect(() => {
        if (open) reset();
    }, [open]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const res = await verifyCurrentPassword(password);
            if (res.success) {
                setStep('checking');
                runChecks();
            } else {
                toast.error(res.error || "Incorrect password");
            }
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const runChecks = async () => {
        // 1. Check Slides
        setChecks(prev => ({ ...prev, slides: { ...prev.slides, status: 'checking' } }));
        await new Promise(r => setTimeout(r, 1000));

        const trainingSlides = moduleData.content?.training?.slides?.length || 0;
        const assessmentSlides = moduleData.content?.assessment?.slides?.length || 0;
        const hasSlides = trainingSlides > 0 || assessmentSlides > 0;

        setChecks(prev => ({
            ...prev,
            slides: {
                status: hasSlides ? 'valid' : 'invalid',
                label: hasSlides
                    ? `${trainingSlides} Training, ${assessmentSlides} Assessment slides verified`
                    : 'No Slides Found'
            }
        }));

        if (!hasSlides) return; // Stop if fatal

        // 2. Check Translations
        setChecks(prev => ({ ...prev, translations: { ...prev.translations, status: 'checking' } }));
        await new Promise(r => setTimeout(r, 1000));

        const hasTranslations = Object.keys(moduleData.content?.translations || {}).length > 0;
        setChecks(prev => ({
            ...prev,
            translations: { status: hasTranslations ? 'valid' : 'invalid', label: hasTranslations ? 'Translations Verified' : 'No Translations (Warning)' }
        }));

        // 3. Check Audio
        setChecks(prev => ({ ...prev, audio: { ...prev.audio, status: 'checking' } }));
        await new Promise(r => setTimeout(r, 1000));

        // Check if ANY audio exists (not necessarily all)
        let hasAudio = false;
        const translations = moduleData.content?.translations || {};
        Object.values(translations).forEach((t: any) => {
            Object.values(t).forEach((s: any) => {
                if (s.hasAudio) hasAudio = true;
            });
        });

        setChecks(prev => ({
            ...prev,
            audio: { status: hasAudio ? 'valid' : 'invalid', label: hasAudio ? 'Audio Assets Verified' : 'No Audio Generated (Warning)' }
        }));

        // Allow publish even if warnings, but critical checks must pass
        setStep('completed');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm bg-[#0f172a] border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-500" />
                        Secure Publish
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                        Verify your identity and validate module integrity before publishing.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 'auth' && (
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Enter Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-slate-900 border-white/10 text-white focus:ring-teal-500"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold" disabled={verifying}>
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </form>
                    )}

                    {(step === 'checking' || step === 'completed') && (
                        <div className="space-y-4">
                            {/* Slides Check */}
                            <CheckItem
                                icon={FileText}
                                label={checks.slides.label}
                                status={checks.slides.status}
                            />

                            {/* Translations Check */}
                            <CheckItem
                                icon={Languages}
                                label={checks.translations.label}
                                status={checks.translations.status}
                            />

                            {/* Audio Check */}
                            <CheckItem
                                icon={Volume2}
                                label={checks.audio.label}
                                status={checks.audio.status}
                            />
                        </div>
                    )}
                </div>

                {step === 'completed' && (
                    <DialogFooter>
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20"
                            onClick={() => {
                                onPublish();
                                onOpenChange(false);
                            }}
                        >
                            Confirm Publish
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

function CheckItem({ icon: Icon, label, status }: { icon: any, label: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' :
                    status === 'invalid' ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-800 text-slate-500'
                    }`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${status === 'pending' ? 'text-slate-500' : 'text-slate-200'
                    }`}>
                    {label}
                </span>
            </div>
            <div>
                {status === 'checking' && <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />}
                {status === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {status === 'invalid' && <XCircle className="w-4 h-4 text-red-500" />}
            </div>
        </div>
    );
}
