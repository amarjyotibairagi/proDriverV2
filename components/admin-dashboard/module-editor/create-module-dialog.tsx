"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveModule } from "@/app/actions/module-editor";
import { useRouter } from "next/navigation";

interface CreateModuleDialogProps {
    className?: string;
    trigger?: React.ReactNode;
}

export function CreateModuleDialog({ className, trigger }: CreateModuleDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error("Please enter a module title");
            return;
        }

        setIsCreating(true);
        try {
            // Initial payload for a new module
            const newModuleData = {
                title: title.trim(),
                slug: `module-${Date.now()}`,
                type: 'TRAINING',
                content: {
                    training: { slides: [{ id: "1", title: "Introduction", content: "Welcome to this safety module.", narration: "", elements: [] }] },
                    assessment: { slides: [] }
                },
                isPublished: false,
                pass_marks: 0,
                total_marks: 0
            };

            const res = await saveModule(null, newModuleData, 'save');

            if (res.success && res.data?.id) {
                toast.success("Module Created!");
                setOpen(false);
                router.push(`/admin/modules/provision?id=${res.data.id}`);
            } else {
                toast.error(res.error || "Failed to create module");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div onClick={() => setOpen(true)} className="contents cursor-pointer">
                {trigger || (
                    <button className={className}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Module
                    </button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Module</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Enter a name for the new training module.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Input
                                id="name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Fire Safety Protocols"
                                className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
