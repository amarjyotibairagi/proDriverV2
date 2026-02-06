"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Car,
  AlertTriangle,
  GraduationCap,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Drivers", active: false },
  { icon: Car, label: "Vehicles", active: false },
  { icon: AlertTriangle, label: "Incidents", active: false },
  { icon: GraduationCap, label: "Training", active: false },
  { icon: FileText, label: "Reports", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-slate-200" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 glass-card z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button for mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500">
              <Shield className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-lg font-bold tracking-widest text-slate-100">
              PRODRIVER
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    item.active
                      ? "bg-gradient-to-r from-teal-500/20 to-amber-500/20 text-slate-100 shadow-lg glow-teal"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      item.active && "text-teal-400"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                  {item.active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-amber-400" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-900">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-500 truncate">
                admin@prodriver.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
