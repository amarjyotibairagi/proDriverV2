"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FolderOpen, Loader2, Check } from "lucide-react";
import { getModules } from "@/app/actions/modules";
import { cn } from "@/lib/utils";

interface ModuleSnippet {
    id: number;
    title: string;
    slug: string;
    updatedAt: Date;
}

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from "lucide-react";

interface LoadModuleDialogProps {
    trigger?: React.ReactNode;
}

export function LoadModuleDialog({ trigger }: LoadModuleDialogProps) {
    const [open, setOpen] = useState(false);
    const [modules, setModules] = useState<ModuleSnippet[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setLoading(true);
            getModules().then(res => {
                if (res.success && res.data) {
                    setModules(res.data as unknown as ModuleSnippet[]);
                }
            }).finally(() => setLoading(false));
        }
    }, [open]);

    const handleSelect = (id: number) => {
        setOpen(false);
        router.push(`/admin/modules/provision?id=${id}`);
    };

    // Sort modules based on ID
    const sortedModules = [...modules].sort((a, b) => {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button
                        className="flex items-center gap-2 px-4 h-9 bg-slate-900 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                        <FolderOpen className="w-3.5 h-3.5 text-teal-500" />
                        Load
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-950 border-white/10 text-slate-200 p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 border-b border-white/10 bg-slate-900/50 flex flex-row items-center justify-between">
                    <DialogTitle className="text-sm font-medium text-slate-300">
                        Load Existing Module
                    </DialogTitle>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                        title={`Sort by ID ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        <span>ID</span>
                        {sortOrder === 'asc' ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                    </button>
                </DialogHeader>

                <Command className="bg-transparent" shouldFilter={true}>
                    <CommandInput placeholder="Search by title..." className="border-none focus:ring-0" />
                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Loading...
                            </div>
                        ) : (
                            <>
                                <CommandEmpty className="py-6 text-center text-xs text-slate-500">
                                    No modules found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {sortedModules.map((mod) => (
                                        <CommandItem
                                            key={mod.id}
                                            value={`${mod.title} ${mod.id}`} // Search by Title and ID
                                            onSelect={() => handleSelect(mod.id)}
                                            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-teal-500/10 flex items-center justify-center text-[10px] font-mono text-teal-400 font-bold border border-teal-500/20 group-hover:border-teal-500/50">
                                                    #{mod.id}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{mod.title}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{new Date(mod.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {/* <Check className="w-4 h-4 text-teal-500 opacity-0 group-aria-selected:opacity-100" /> */}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
