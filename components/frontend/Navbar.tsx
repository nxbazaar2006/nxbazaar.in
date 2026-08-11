"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import logo from "../../public/limiLogo.webp";
import UserAvatar from "../backoffice/UserAvatar";
import { LiquidGlassButton } from "../ui/liquid-glass-button";
import CartCount from "./CartCount";
import HelpModal from "./HelpModal";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchForm from "./SearchForm";

export default function Navbar({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  if (pathname === "/" && !embedded) return null;

  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/20 backdrop-blur-2xl shadow-sm transition-all duration-300">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-12 py-3 text-sm font-medium">
          {t("common.loading")}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/20 backdrop-blur-2xl shadow-md transition-all duration-300">
      <div className="flex w-full flex-col gap-2 px-3 py-2 sm:px-6 sm:py-3 lg:px-10">
        {/* Main Row */}
        <div className="flex w-full items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Brand Logo */}
          <Link href="/" className="shrink-0 transition hover:opacity-90">
            <Image
              src={logo}
              alt="NXBazaar Logo"
              className="h-auto w-24 sm:w-28 md:w-32 object-contain"
              priority
            />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden flex-1 max-w-3xl md:block">
            <SearchForm />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            {status === "unauthenticated" ? (
              <LiquidGlassButton
                asChild
                size="sm"
                variant="primary"
                leftIcon={<User />}
                className="px-2.5 sm:px-4 text-xs sm:text-sm"
              >
                <Link href="/login">{t("navbar.account")}</Link>
              </LiquidGlassButton>
            ) : (
              <UserAvatar user={session?.user} />
            )}

            <HelpModal />
            <CartCount />
          </div>
        </div>

        {/* Mobile Search Bar (< 768px) */}
        <div className="block w-full md:hidden pt-1">
          <SearchForm />
        </div>
      </div>
    </header>
  );
}
