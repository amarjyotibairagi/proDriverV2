"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FolderOpen, Plus, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { LoadModuleDialog } from "./load-module-dialog";
import { CreateModuleDialog } from "./create-module-dialog";

interface ProvisionWelcomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProvisionWelcomeDialog({ open, onOpenChange }: ProvisionWelcomeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#020617]/95 border-white/10 backdrop-blur-2xl text-white p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(45,212,191,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

                <div className="px-10 pt-12 pb-8 relative z-10">
                    <DialogHeader className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-teal-500/10">
                            <Sparkles className="w-8 h-8 text-teal-400" />
                        </div>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-[-0.04em] text-white">
                            Get Started
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] italic mt-2">
                            Select an option to begin creating or editing modules
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 pb-4">
                        {/* Option 1: Load */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="group relative"
                        >
                            <LoadModuleDialog
                                trigger={
                                    <button className="w-full text-left p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all h-full flex flex-col items-center justify-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                            <BookOpen className="w-7 h-7 text-slate-400 group-hover:text-teal-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black italic uppercase tracking-tight text-white mb-1">Open Existing</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Load a module from the repository</p>
                                        </div>
                                    </button>
                                }
                            />
                        </motion.div>

                        {/* Option 2: Create */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="group relative"
                        >
                            <CreateModuleDialog
                                trigger={
                                    <button className="w-full text-left p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all h-full flex flex-col items-center justify-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                            <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black italic uppercase tracking-tight text-white mb-1">Create New</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Setup a new training or assessment</p>
                                        </div>
                                    </button>
                                }
                            />
                        </motion.div>
                    </div>
                </div>

                <div className="px-10 py-6 bg-white/5 border-t border-white/5 flex justify-center relative z-10">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                        Module Provisioning Interface // SafeDoc Admin
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
