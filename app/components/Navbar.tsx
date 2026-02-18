"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
    user: User;
}

export default function Navbar({ user }: NavbarProps) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <nav className="backdrop-blur-xl bg-white/[0.04] border-b border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Smart Bookmark</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group flex items-center gap-3 cursor-default">
                        {user.user_metadata?.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="avatar"
                                className="w-8 h-8 rounded-full ring-2 ring-white/10"
                            />
                        )}
                        {user.email && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-800 border border-white/10 text-xs text-slate-300 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50">
                                {user.email}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-l border-t border-white/10 rotate-45" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-all duration-200 cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
