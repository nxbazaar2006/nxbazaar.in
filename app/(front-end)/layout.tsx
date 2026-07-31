import Footer from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import AiChatPanel from "@/components/ai/AiChatPanel";
import React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="frontend-background min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
  <section className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:p-8">
    {children}
  </section>
</div>

      {process.env.AI_ENABLED?.toLowerCase() !== "false" && (
        <AiChatPanel />
      )}

      <Footer />
    </div>
  );
}