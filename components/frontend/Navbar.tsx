"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../../public/limiLogo.webp";
import UserAvatar from "../backoffice/UserAvatar";
import { LiquidGlassButton } from "../ui/liquid-glass-button";
import CartCount from "./CartCount";
import HelpModal from "./HelpModal";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchForm from "./SearchForm";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  if (status === "loading") {
    return (
      <div className="sticky top-0 z-50 w-full px-4 py-3 sm:px-6 md:px-8 backdrop-blur-md">
        <div className="frontend-glass w-full flex items-center justify-between rounded-[34px] px-6 py-3 text-sm font-medium text-slate-700 shadow-xl">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 backdrop-blur-xl transition-all duration-300">
      <div className="frontend-glass w-full flex items-center justify-between rounded-[36px] px-4 py-2.5 sm:px-6 md:px-8 gap-3 sm:gap-6 shadow-2xl border border-white/60">
        {/* Brand Logo */}
        <Link href="/" className="shrink-0 transition hover:opacity-90">
          <Image src={logo} alt="NXBazaar Logo" className="w-24 sm:w-28 h-auto object-contain" priority />
        </Link>

        {/* Global Search Bar */}
        <div className="hidden flex-grow max-w-3xl md:block">
          <SearchForm />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LanguageSwitcher />

          {status === "unauthenticated" ? (
            <LiquidGlassButton asChild size="sm" variant="primary" leftIcon={<User />}>
              <Link href="/login">{t("navbar.account")}</Link>
            </LiquidGlassButton>
          ) : (
            <UserAvatar user={session?.user} />
          )}

          <HelpModal />
          <CartCount />
        </div>
      </div>
    </header>
  );
}