"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo, useRef } from "react";

interface Bookmark {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
}

interface BookmarkListProps {
    userId: string;
    bookmarks: Bookmark[];
    loading: boolean;
    handleDelete: (id: string) => Promise<void>;
}

export default function BookmarkList({ userId, bookmarks, loading, handleDelete }: BookmarkListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const internalHandleDelete = async (id: string) => {
        setDeletingId(id);
        await handleDelete(id);
        setDeletingId(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredBookmarks = useMemo(() => {
        if (!searchQuery.trim()) return bookmarks;
        const q = searchQuery.toLowerCase();
        return bookmarks.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.url.toLowerCase().includes(q)
        );
    }, [bookmarks, searchQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-400 text-sm">Loading bookmarks...</p>
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-24 h-24 bg-white/[0.03] border border-white/[0.06] rounded-3xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm">
                        <svg className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 tracking-tight">Nothing to see</h3>
                <p className="text-slate-500 text-sm mt-3 max-w-[240px] leading-relaxed">
                    Your collection is currently empty. Start by adding your first bookmark!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
            {/* Static Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-2">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Your Bookmarks
                    <span className="ml-1 text-sm font-normal text-slate-500">
                        ({bookmarks.length})
                    </span>
                </h2>

                <div className="relative sm:ml-auto w-full sm:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search bookmarks…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-200 text-sm"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredBookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-4">
                        {filteredBookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className="group backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white font-medium hover:text-indigo-300 transition-colors duration-150 block truncate"
                                        >
                                            {bookmark.title}
                                        </a>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors duration-150 block truncate mt-1"
                                        >
                                            {bookmark.url}
                                        </a>
                                        <p className="text-xs text-slate-600 mt-2">
                                            {formatDate(bookmark.created_at)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => internalHandleDelete(bookmark.id)}
                                        disabled={deletingId === bookmark.id}
                                        className="flex-shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                                        title="Delete bookmark"
                                    >
                                        {deletingId === bookmark.id ? (
                                            <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h4 className="text-slate-300 font-medium">No matches found</h4>
                        <p className="text-slate-500 text-sm mt-1">Try a different search term or check for typos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
