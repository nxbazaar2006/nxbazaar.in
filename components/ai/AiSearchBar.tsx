"use client";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
export default function AiSearchBar() { const [query, setQuery] = useState(""); const router = useRouter(); function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = query.trim(); if (!value) return; router.push(`/search?search=${encodeURIComponent(value)}&ai=1`); } return ( <form onSubmit={submit} className="flex items-center gap-2"> <div className="relative min-w-0 flex-1"> <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100" /> <input value={query} onChange={(event) => setQuery(event.target.value)} className="liquid-card block w-full rounded-full border-0 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/60 focus:ring-2 focus:ring-cyan-200" placeholder="Office ke liye comfortable black shoes" aria-label="AI semantic product search" /> </div> <LiquidGlassButton type="submit" variant="cyan" leftIcon={<Search />}> Search </LiquidGlassButton> </form> );
}
