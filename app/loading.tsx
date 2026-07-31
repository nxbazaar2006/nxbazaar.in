import { LoaderCircle } from "lucide-react";
export default function Loading() {
    return (<main className="liquid-glass flex min-h-[60vh] items-center justify-center px-4 py-16 text-white"> <div className="liquid-glass-control liquid-glass-card-shell liquid-glass-neutral flex items-center gap-3 p-5" role="status" aria-live="polite" > <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" /> <span className="liquid-glass-content flex items-center gap-3"> <LoaderCircle className="h-5 w-5 animate-spin text-cyan-100" aria-hidden="true" /> <span className="text-sm font-medium text-white">Loading Nxbazaar.in</span> </span> </div> </main>);
}
