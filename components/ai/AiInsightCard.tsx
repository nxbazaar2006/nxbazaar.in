"use client"; type AiInsightCardProps = { title: string; summary: string; severity?: "low" | "medium" | "high";
};
export default function AiInsightCard({ title, summary, severity = "low" }: AiInsightCardProps) { const tone = severity === "high" ? "border-red-300/30 bg-red-500/10" : severity === "medium" ? "border-amber-300/30 bg-amber-500/10" : "border-cyan-300/30 bg-cyan-500/10"; return ( <article className={`rounded-lg border p-4 text-white ${tone}`}> <h3 className="text-sm font-semibold">{title}</h3> <p className="mt-2 text-sm text-white/75">{summary}</p> </article> );
}
