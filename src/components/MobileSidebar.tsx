"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Open menu"
        >
            <Menu size={22} />
        </button>
    );
}

export function MobileSidebar({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Hamburger button - only on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 shadow-lg"
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-out drawer */}
            <div
                className={`
                    fixed top-0 left-0 h-full z-50 w-64
                    bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl
                    border-r border-gray-200 dark:border-white/10
                    transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 lg:transition-none
                    ${open ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Close button inside drawer - mobile only */}
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>

                {/* Pass sidebar content through */}
                <div onClick={() => setOpen(false)}>
                    {children}
                </div>
            </div>
        </>
    );
}
