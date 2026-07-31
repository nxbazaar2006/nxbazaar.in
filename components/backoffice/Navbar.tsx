"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import UserAvatar from "./UserAvatar";

export default function Navbar({ setShowSidebar, showSidebar }) {
  const { data: session, status } = useSession();
  const notifications = [
    "Yellow Sweet Corn Stock out",
    "New farmer registration waiting",
    "Market inventory needs review",
  ];

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <header className="backoffice-navbar backoffice-glass rounded-none text-cyan-50">
      <div className="flex h-full min-w-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="dashboard-submit-action liquid-glass-control liquid-glass-primary relative mt-0 grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full p-1.5 text-white min-[1024px]:hidden"
            type="button"
            aria-label="Toggle sidebar"
          >
            <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
            <span className="liquid-glass-content grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10">
              <Image
                src="/image3.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </span>
          </button>
          <Link
            href="/dashboard"
            className="truncate text-lg font-semibold min-[1024px]:hidden"
          >
            Nxbazaar.in
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button
              type="button"
              className="liquid-circle relative h-11 w-11 text-cyan-100"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <div className="absolute -top-1 end-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ff75b6] text-[0.65rem] font-bold text-white shadow-lg shadow-[#0b3444]/20">
                20
              </div>
            </button></DropdownMenuTrigger>
            <DropdownMenuContent className="backoffice-glass min-w-80 px-4 py-3 text-cyan-50">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification, index) => (
                <DropdownMenuItem key={index}>
                  <div className="flex w-full items-center gap-3 py-2">
                    <div className="liquid-circle h-9 w-9 shrink-0 text-xs font-semibold text-cyan-100">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {notification}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-cyan-200/80">
                        <span className="rounded-full bg-[#ff75b6]/15 px-2 py-0.5 text-pink-200">
                          Stock Out
                        </span>
                        <span>Dec 12 2021 - 12:40PM</span>
                      </div>
                    </div>
                    <button className="text-cyan-200/80" type="button">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {status === "authenticated" && <UserAvatar user={session?.user} />}
        </div>
      </div>
    </header>
  );
}
