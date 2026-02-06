"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotifications, markAsRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";

interface NotificationsDropdownProps {
    userId?: string;
    role?: 'ADMIN' | 'BASIC';
}

export function NotificationsDropdown({ userId, role = 'BASIC' }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifs = async () => {
        setLoading(true);
        const res = await getNotifications(userId, role);
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [userId, role]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markAsRead(id);

        if (link) {
            setIsOpen(false);
            router.push(link);
        }
    };

    return (
        <div className="relative z-[9999]" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3.5 glass-card rounded-2xl hover:bg-white/10 transition-colors border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl shadow-2xl group"
            >
                <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse rounded-full border border-[#0f172a]" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-96 max-h-[500px] flex flex-col bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[9999] ring-1 ring-white/5"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-teal-500 text-[#0f172a] text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                                )}
                            </h3>
                            <button
                                onClick={fetchNotifs}
                                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5" />}
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center gap-3 text-slate-500/50">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    <p className="text-xs uppercase font-bold tracking-widest">No updates yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <button
                                            key={n.id}
                                            onClick={() => handleMarkRead(n.id, n.link)}
                                            className={`w-full text-left p-5 hover:bg-white/[0.02] transition-colors flex gap-4 group ${!n.isRead ? 'bg-white/[0.03]' : ''}`}
                                        >
                                            <div className={`mt-1 shrink-0 p-2 rounded-xl border ${n.type === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                n.type === 'OPERATIONAL' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                                }`}>
                                                {n.type === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> :
                                                    n.type === 'OPERATIONAL' ? <Info className="w-4 h-4" /> :
                                                        <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-xs font-bold truncate ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 opacity-50">
                                                    {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View All */}
                        {/* <div className="p-3 border-t border-white/5 bg-white/[0.02]">
              <button className="w-full py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
                View History
              </button>
            </div> */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
