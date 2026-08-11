import AiChatPanel from "@/components/ai/AiChatPanel";
import Footer from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const isAiEnabled = process.env.AI_ENABLED?.toLowerCase() !== "false";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#08111c]">
      <Navbar />
      {children}

      {isAiEnabled && <AiChatPanel />}

      <Footer />
    </div>
  );
}
