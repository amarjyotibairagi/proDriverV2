"use client";

import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Safety Command Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time HSE monitoring and analytics
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300 hidden sm:inline">{today}</span>
          <span className="text-sm text-slate-300 sm:hidden">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <button
          type="button"
          className="relative p-2 glass-card rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Button
          variant="destructive"
          className="pulse-emergency bg-red-600 hover:bg-red-700 text-red-50 gap-2 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Emergency Alert</span>
          <span className="sm:hidden">Alert</span>
        </Button>
      </div>
    </header>
  );
}
