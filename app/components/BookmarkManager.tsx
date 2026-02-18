"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkList from "./BookmarkList";

interface Bookmark {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
}

interface BookmarkManagerProps {
    userId: string;
}

export default function BookmarkManager({ userId }: BookmarkManagerProps) {
    const supabase = useMemo(() => createClient(), []);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        let isMounted = true;

        const setup = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                supabase.realtime.setAuth(session.access_token);
            }

            if (!isMounted) return;

            const { data, error } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (!error && data && isMounted) {
                setBookmarks(data);
            }
            if (isMounted) setLoading(false);

            const channel = supabase
                .channel(`bookmarks-manager-${userId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "bookmarks",
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const newBookmark = payload.new as Bookmark;
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
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        const updatedBookmark = payload.new as Bookmark;
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
                        if (!oldBookmark.id) return;
                        setBookmarks((prev) =>
                            prev.filter((b) => b.id !== oldBookmark.id)
                        );
                    }
                )
                .subscribe();

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
        // Pure Supabase approach: No optimistic update here.
        // The list will update when the 'DELETE' event is received from Supabase.
        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
            {/* Desktop Left Sidebar: Now inside BookmarkManager to share state */}
            <div className="hidden lg:block w-[380px] lg:flex-shrink-0 lg:sticky lg:top-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        Add New Bookmark
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Collect and organize your favorite links.
                    </p>
                </div>
                <AddBookmarkForm userId={userId} />
            </div>

            {/* Main List Column */}
            <div className="w-full lg:flex-1 min-w-0 backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-3xl p-4 sm:p-8 shadow-2xl">
                <BookmarkList
                    bookmarks={bookmarks}
                    loading={loading}
                    handleDelete={handleDelete}
                    userId={userId}
                />
            </div>
        </div>
    );
}
