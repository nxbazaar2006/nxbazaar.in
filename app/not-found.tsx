import Link from "next/link";
import { Home } from "lucide-react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
export default function NotFound() { return ( <main className="liquid-glass flex min-h-[70vh] items-center justify-center px-4 py-16 text-white"> <section className="liquid-glass-control liquid-glass-card-shell liquid-glass-neutral max-w-xl p-8 text-center"> <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" /> <div className="liquid-glass-content space-y-4"> <p className="text-sm font-semibold uppercase tracking-normal text-cyan-100"> Page not found </p> <h1 className="text-2xl font-semibold text-white">This page is not available.</h1> <p className="text-sm leading-6 text-slate-100"> The product, category or dashboard page may have moved. </p> <LiquidGlassButton asChild variant="primary" leftIcon={<Home />}> <Link href="/">Go Home</Link> </LiquidGlassButton> </div> </section> </main> );
}
