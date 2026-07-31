"use client";

import {
  BookOpenText,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  HeartHandshake,
  LayoutGrid,
  Layers,
  LayoutList,
  LogOut,
  MonitorPlay,
  Newspaper,
  ReceiptText,
  ScanSearch,
  Truck,
  User,
  UserSquare2,
  Users2,
  Video,
  Warehouse,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Sidebar({
  showSidebar,
  setShowSidebar,
  expanded,
  onMouseEnter,
  onMouseLeave,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  const role = session?.user?.role;
  const userStatus = session?.user?.status || false;

  let sidebarLinks = [
    { title: "Customers", icon: Users2, href: "/dashboard/customers" },
    { title: "Markets", icon: Warehouse, href: "/dashboard/markets" },
    { title: "Farmers", icon: UserSquare2, href: "/dashboard/farmers" },
    { title: "Orders", icon: Truck, href: "/dashboard/orders" },
    { title: "Sales", icon: Truck, href: "/dashboard/sales" },
    { title: "Staff", icon: User, href: "/dashboard/staff" },
    { title: "Blogs", icon: BookOpenText, href: "/dashboard/blogs" },
    { title: "Vlogs", icon: Video, href: "/dashboard/vlogs" },
    { title: "Wallet", icon: CircleDollarSign, href: "/dashboard/wallet" },
    {
      title: "Farmer Support",
      icon: HeartHandshake,
      href: "/dashboard/farmer-support",
    },
    { title: "Settings", icon: LayoutGrid, href: "/dashboard/settings" },
    { title: "Online Store", icon: ExternalLink, href: "/" },
  ];

  let catalogueLinks = [
    { title: "Products", icon: Boxes, href: "/dashboard/products" },
    { title: "Scanner", icon: ScanSearch, href: "/dashboard/products/scanner" },
    { title: "Categories", icon: LayoutList, href: "/dashboard/categories" },
    { title: "Subcategories", icon: Layers, href: "/dashboard/subcategories" },
    { title: "HSN Code", icon: ReceiptText, href: "/dashboard/hsn-codes" },
    { title: "Coupons", icon: ScanSearch, href: "/dashboard/coupons" },
    { title: "Banners", icon: MonitorPlay, href: "/dashboard/banners" },
  ];

  if (role === "FARMER") {
    sidebarLinks = [
      { title: "Sales", icon: Truck, href: "/dashboard/sales" },
      { title: "Wallet", icon: CircleDollarSign, href: "/dashboard/wallet" },
      {
        title: "Farmer Support",
        icon: HeartHandshake,
        href: "/dashboard/farmer-support",
      },
      { title: "Settings", icon: LayoutGrid, href: "/dashboard/settings" },
      { title: "Online Store", icon: ExternalLink, href: "/" },
    ];
    catalogueLinks = [
      { title: "Products", icon: Boxes, href: "/dashboard/products" },
      { title: "Scanner", icon: ScanSearch, href: "/dashboard/products/scanner" },
      { title: "Coupons", icon: ScanSearch, href: "/dashboard/coupons" },
    ];
  }

  if (role === "USER") {
    sidebarLinks = [
      { title: "My Orders", icon: Truck, href: "/dashboard/orders" },
      { title: "Profile", icon: Truck, href: "/dashboard/profile" },
      { title: "Online Store", icon: ExternalLink, href: "/" },
    ];
    catalogueLinks = [];
  }

  if (role === "FARMER" && userStatus === false) {
    sidebarLinks = [];
    catalogueLinks = [];
  }

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  const labelClass = expanded
    ? "visible ml-4 translate-x-0 whitespace-nowrap opacity-100 transition-all duration-200"
    : "invisible ml-4 -translate-x-2 whitespace-nowrap opacity-0 transition-all duration-200";
  const tooltipClass =
    "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 rounded-xl border border-white/20 bg-slate-950/90 px-3 py-2 text-sm text-white opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100";

  function renderNavLink(item) {
    const Icon = item.icon;
    const active = item.href === pathname;

    return (
      <Link
        onClick={() => setShowSidebar(false)}
        key={item.href}
        href={item.href}
        className={
          active
            ? "group relative flex h-12 items-center rounded-2xl border border-[#b8e7f4]/55 bg-[#7ed9e9]/20 px-5 text-[#0d5069] shadow-sm transition-all duration-300"
            : "group relative flex h-12 items-center rounded-2xl px-5 text-[#2f6d85] transition-all duration-300 hover:bg-[#7ed9e9]/14"
        }
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className={labelClass}>{item.title}</span>
        {!expanded && <span className={tooltipClass}>{item.title}</span>}
      </Link>
    );
  }

  return (
    <aside
      className="backoffice-sidebar liquid-card shrink-0 rounded-r-[var(--card-radius)] rounded-l-none px-4 py-5 text-[#103c55]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="backoffice-sidebar-scroll h-full overflow-y-auto overflow-x-hidden pb-8">
        <Link
          onClick={() => setShowSidebar(false)}
          href="/dashboard"
          className="group relative mb-6 flex h-12 items-center rounded-2xl px-5 text-[#103c55]"
        >
          <span className="liquid-circle h-11 w-11 shrink-0 text-sm font-bold text-[#15516d]">
            NX
          </span>
          <span className={labelClass}>Nxbazaar.in</span>
          {!expanded && <span className={tooltipClass}>Nxbazaar.in</span>}
        </Link>

        <div className="flex flex-col space-y-2">
          {renderNavLink({
            title: "Dashboard",
            icon: LayoutGrid,
            href: "/dashboard",
          })}

          {catalogueLinks.length > 0 && (
            <Collapsible className="px-0" open={expanded && openMenu}>
              <CollapsibleTrigger asChild onClick={() => setOpenMenu(!openMenu)}>
                <button className="group relative flex h-12 w-full items-center rounded-2xl px-5 text-[#2f6d85] transition-all duration-300 hover:bg-[#7ed9e9]/14">
                  <Layers className="h-5 w-5 shrink-0" />
                  <span className={labelClass}>Catalogue</span>
                  {openMenu ? (
                    <ChevronDown
                      className={
                        expanded
                          ? "ml-auto h-4 w-4 shrink-0 opacity-100 transition-opacity"
                          : "ml-auto h-4 w-4 shrink-0 opacity-0 transition-opacity"
                      }
                    />
                  ) : (
                    <ChevronRight
                      className={
                        expanded
                          ? "ml-auto h-4 w-4 shrink-0 opacity-100 transition-opacity"
                          : "ml-auto h-4 w-4 shrink-0 opacity-0 transition-opacity"
                      }
                    />
                  )}
                  {!expanded && <span className={tooltipClass}>Catalogue</span>}
                </button>
              </CollapsibleTrigger>

              {expanded && (
                <CollapsibleContent className="my-2 rounded-3xl border border-[#b8e7f4]/30 bg-[#5fb0ce]/10 px-3 py-3 text-[#2f6d85]">
                  {catalogueLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        onClick={() => setShowSidebar(false)}
                        key={item.href}
                        href={item.href}
                        className={
                          active
                            ? "flex h-10 items-center rounded-2xl bg-[#7ed9e9]/20 px-3 text-sm text-[#0d5069]"
                            : "flex h-10 items-center rounded-2xl px-3 text-sm transition hover:bg-[#7ed9e9]/14"
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="ml-3 whitespace-nowrap">{item.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              )}
            </Collapsible>
          )}

          {sidebarLinks.map((item) => renderNavLink(item))}

          <div className="px-1 py-1.5 flex justify-start">
            <button
              type="button"
              onClick={handleLogout}
              className="dashboard-submit-action liquid-glass-control liquid-glass-primary relative mt-0 flex h-9 min-h-9 w-auto shrink-0 items-center gap-2 rounded-full py-0.5 pl-3.5 pr-1 font-semibold !text-white shadow-sm hover:opacity-90 transition-all [&_*]:!text-white [&_svg]:!stroke-white"
            >
              <span
                className="liquid-glass-inner pointer-events-none"
                aria-hidden="true"
              />
              <span
                className={`liquid-glass-content text-xs font-semibold text-white ${expanded ? "visible opacity-100" : "sr-only"
                  }`}
              >
                Logout
              </span>
              <span className="liquid-glass-content grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10">
                <LogOut className="h-3.5 w-3.5 text-white" />
              </span>
              {!expanded && <span className={tooltipClass}>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
