"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProfilePopup } from "./admin-profile-popup";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck,
  BarChart3,
  History,
  Database,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  Zap,
  Activity
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Modules", href: "/admin/modules", icon: BookOpen },
  { name: "Assignments", href: "/admin/assignments", icon: FileCheck },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit", icon: History },
  { name: "Master Data", href: "/admin/master-data", icon: Database },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <>
      <AnimatePresence>
        {/* Mobile Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-card lg:hidden hover:bg-white/10 transition-colors border border-white/5 shadow-2xl"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-teal-500" />
        </motion.button>
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-500 lg:translate-x-0 border-r border-white/5 bg-[#020617] backdrop-blur-3xl overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-48 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="h-20 flex items-center gap-4 px-7 border-b border-white/5 relative z-10 group">
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1.5 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity"
            />
            <div className="relative p-2 rounded-xl bg-slate-900 border border-white/10 shadow-2xl">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <span className="text-sm font-black tracking-[0.3em] text-white uppercase italic">
              ProDriver
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Operational</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 lg:hidden border border-white/5"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-8 px-5 custom-scrollbar relative z-10">
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.li variants={itemVariant} key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 group relative uppercase tracking-widest italic overflow-hidden",
                      isActive
                        ? "text-slate-950"
                        : "text-slate-500 hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-teal-500 shadow-xl shadow-teal-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-all relative z-10",
                        isActive ? "text-slate-950" : "text-slate-600 group-hover:text-teal-500 group-hover:scale-110"
                      )}
                    />
                    <span className="relative z-10">{item.name}</span>

                    {!isActive && (
                      <div className="absolute inset-0 bg-white/[0.03] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />
                    )}

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-slate-950/40 relative z-10"
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        {/* Footer Profile */}
        <div className="p-6 border-t border-white/5 bg-black/40 relative z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer group text-left border border-white/5 shadow-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
              <span className="text-[10px] font-black text-slate-950 uppercase">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-100 truncate group-hover:text-teal-400 transition-colors uppercase italic tracking-tighter">
                Administrator Profile
              </p>
              <p className="text-[9px] text-slate-600 truncate uppercase font-bold tracking-widest mt-0.5">
                Verified Access
              </p>
            </div>
            <Activity className="w-3.5 h-3.5 text-slate-700 group-hover:text-teal-500 transition-colors" />
          </motion.button>
        </div>
      </aside>

      <AdminProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userId="ADMIN001"
      />

      <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>
    </>
  );
}