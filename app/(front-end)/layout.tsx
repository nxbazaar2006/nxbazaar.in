import AiChatPanel from "@/components/ai/AiChatPanel";
import Footer from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const isAiEnabled = process.env.AI_ENABLED?.toLowerCase() !== "false";

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden text-[#103c55]">
      <Navbar />

      <main className="w-full flex-1 px-2.5 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-4 lg:py-6">
        <section
          className="
            liquid-card
            mx-auto
            w-full
            max-w-screen-2xl
            2xl:max-w-[1800px]
            p-3.5
            sm:p-5
            md:p-7
            lg:p-9
            xl:p-11
            2xl:p-12
            min-h-[calc(100vh-140px)]
            transition-all
            duration-300
          "
        >
          {children}
        </section>
      </main>

      {isAiEnabled && <AiChatPanel />}

      <Footer />
    </div>
  );
}

<body
        className="
          liquid-glass-panel
          min-h-screen
          overflow-x-hidden
          antialiased
          text-[#103c55]
        "
      ></body>