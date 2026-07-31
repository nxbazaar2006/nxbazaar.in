"use client";
import { RotateCcw } from "lucide-react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
export default function GlobalError({ error, reset,
}: { error: Error & { digest?: string }; reset: () => void;
}) { return ( <main className="liquid-glass flex min-h-[70vh] items-center justify-center px-4 py-16 text-white"> <section className="liquid-glass-control liquid-glass-card-shell liquid-glass-neutral max-w-xl p-8 text-center"> <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" /> <div className="liquid-glass-content space-y-4"> <p className="text-sm font-semibold uppercase tracking-normal text-cyan-100"> Something went wrong </p> <h1 className="text-2xl font-semibold text-white">We could not load this page.</h1> <p className="text-sm leading-6 text-slate-100"> Try again, or return to the previous page if the problem continues. </p> {error.digest ? ( <p className="text-xs text-slate-300">Reference: {error.digest}</p> ) : null} <LiquidGlassButton type="button" variant="primary" leftIcon={<RotateCcw />} onClick={reset}> Try Again </LiquidGlassButton> </div> </section> </main> );
}
