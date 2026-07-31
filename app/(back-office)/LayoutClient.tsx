"use client";
import Navbar from "@/components/backoffice/Navbar";
import Sidebar from "@/components/backoffice/Sidebar";
import React, { useState } from "react";
export default function LayoutClient({ children,
}: { children: React.ReactNode;
}) { const [showSidebar, setShowSidebar] = useState(false); const [sidebarHovered, setSidebarHovered] = useState(false); const handleSidebarMouseEnter = () => { if (window.innerWidth >= 1024) { setSidebarHovered(true); } };
const handleSidebarMouseLeave = () => { if (window.innerWidth >= 1024) { setSidebarHovered(false); } }; return ( <div className="backoffice-background backoffice-shell min-h-screen w-full overflow-x-clip" data-sidebar-hovered={sidebarHovered} data-sidebar-open={showSidebar} > <div className="liquid-glass-glow liquid-glass-glow-left" /> <div className="liquid-glass-glow liquid-glass-glow-right" /> <div className="liquid-glass-grid" /> <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} expanded={sidebarHovered || showSidebar} onMouseEnter={handleSidebarMouseEnter} onMouseLeave={handleSidebarMouseLeave} /> {showSidebar && ( <button aria-label="Close sidebar" className="fixed inset-0 z-[45] bg-[#07334a]/24 backdrop-blur-sm min-[1024px]:hidden" onClick={() => setShowSidebar(false)} type="button" /> )} <Navbar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> <main className="backoffice-content"> <div className="backoffice-content-inner">{children}</div> </main> </div> );
}
