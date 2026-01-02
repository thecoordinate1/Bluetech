"use client";

import { Button } from "@/components/ui/button";

export function NewsletterForm() {
    return (
        <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <Button size="sm" className="w-full rounded-lg">Subscribe</Button>
        </form>
    );
}
