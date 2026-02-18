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
}

export default function BookmarkList({ userId }: BookmarkListProps) {
    const supabase = useMemo(() => createClient(), []);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        let isMounted = true;

        const setup = async () => {
            // 1. Wait for auth session to be ready — this ensures the
            //    realtime WebSocket is authenticated so RLS works for INSERT events
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Auth session ready:", !!session);

            // 2. Explicitly set auth token on the realtime WebSocket connection.
            //    Without this, other tabs may connect without auth, and RLS
            //    will block INSERT event broadcasts to those tabs.
            if (session?.access_token) {
                supabase.realtime.setAuth(session.access_token);
            }

            if (!isMounted) return;

            // 2. Fetch initial bookmarks
            const { data, error } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (!error && data && isMounted) {
                setBookmarks(data);
            }
            if (isMounted) setLoading(false);

            // 3. Subscribe to realtime AFTER auth is confirmed
            const channel = supabase
                .channel(`bookmarks-${userId}-${Date.now()}`) // unique channel name
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "bookmarks",
                    },
                    (payload) => {
                        const newBookmark = payload.new as Bookmark;
                        if (newBookmark.user_id !== userId) return;
                        console.log("Realtime INSERT received:", newBookmark);
                        setBookmarks((prev) => {
                            if (prev.some((b) => b.id === newBookmark.id)) return prev;
                            return [newBookmark, ...prev];
                        });
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "bookmarks",
                    },
                    (payload) => {
                        const updatedBookmark = payload.new as Bookmark;
                        if (updatedBookmark.user_id !== userId) return;
                        console.log("Realtime UPDATE received:", updatedBookmark);
                        setBookmarks((prev) =>
                            prev.map((b) =>
                                b.id === updatedBookmark.id ? updatedBookmark : b
                            )
                        );
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "bookmarks",
                    },
                    (payload) => {
                        const oldBookmark = payload.old as Partial<Bookmark>;
                        if (!oldBookmark.id) return; // safety guard
                        console.log("Realtime DELETE received:", oldBookmark);
                        setBookmarks((prev) =>
                            prev.filter((b) => b.id !== oldBookmark.id)
                        );
                    }
                )
                .subscribe((status, err) => {
                    console.log("Realtime status:", status);
                    if (err) console.error("Realtime error:", err);
                });

            channelRef.current = channel;
        };

        setup();

        return () => {
            isMounted = false;
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [userId, supabase]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        // Optimistically remove immediately for snappier UX
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            console.error("Delete error:", error);
            // Rollback — re-fetch to restore state
            const { data } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });
            if (data) setBookmarks(data);
        }
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
                <h3 className="text-slate-300 font-medium">No bookmarks yet</h3>
                <p className="text-slate-500 text-sm mt-1">Add your first bookmark above to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Your Bookmarks
                <span className="ml-auto text-sm font-normal text-slate-500">
                    {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
                </span>
            </h2>

            {bookmarks.map((bookmark) => (
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
                            onClick={() => handleDelete(bookmark.id)}
                            disabled={deletingId === bookmark.id}
                            className="flex-shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
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
    );
}
