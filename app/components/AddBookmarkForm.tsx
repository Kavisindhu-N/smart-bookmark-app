"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useMemo } from "react";

interface AddBookmarkFormProps {
    userId: string;
}

export default function AddBookmarkForm({ userId }: AddBookmarkFormProps) {
    const supabase = useMemo(() => createClient(), []);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Basic URL validation — add protocol if missing
            let finalUrl = url.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = "https://" + finalUrl;
            }

            const { error: insertError } = await supabase
                .from("bookmarks")
                .insert({
                    title: title.trim(),
                    url: finalUrl,
                    user_id: userId,
                });

            if (insertError) throw insertError;

            setTitle("");
            setUrl("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to add bookmark";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Bookmark
                </h2>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-200 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="URL (e.g., example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-200 text-sm"
                    />
                </div>

                {error && (
                    <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding...
                        </span>
                    ) : (
                        "Add Bookmark"
                    )}
                </button>
            </div>
        </form>
    );
}
