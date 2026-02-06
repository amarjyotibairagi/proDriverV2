import React from "react";

interface ModuleEditorLayoutProps {
    header: React.ReactNode;
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
}

export function ModuleEditorLayout({ header, leftPanel, rightPanel }: ModuleEditorLayoutProps) {
    return (
        <div className="flex flex-col h-screen bg-[#020617] overflow-hidden">
            {/* Full Width Header */}
            <div className="shrink-0 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl z-50">
                {header}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Controls */}
                <div className="w-1/2 border-r border-white/10 flex flex-col h-full bg-[#0f172a]/50 backdrop-blur-xl">
                    {leftPanel}
                </div>

                {/* Right Panel: Simulator */}
                <div className="w-1/2 flex items-center justify-center bg-slate-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-slate-950 to-slate-950" />
                    {rightPanel}
                </div>
            </div>
        </div>
    );
}
