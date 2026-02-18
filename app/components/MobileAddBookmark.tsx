"use client";

import { useState } from "react";
import AddBookmarkForm from "./AddBookmarkForm";

interface MobileAddBookmarkProps {
    userId: string;
}

export default function MobileAddBookmark({ userId }: MobileAddBookmarkProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="lg:hidden">
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 z-40 active:scale-95 transition-transform duration-200 border border-white/20"
                aria-label="Add Bookmark"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12m6-6H6" />
                </svg>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-lg font-semibold text-white px-2">Add New Bookmark</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Container */}
                        <div className="p-6">
                            <AddBookmarkForm userId={userId} onSuccess={() => setIsOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
