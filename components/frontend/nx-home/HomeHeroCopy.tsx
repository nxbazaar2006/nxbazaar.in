"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomeHeroCopy() {
  const { t } = useTranslation();

  return (
    <div className="nx-hero-copy nx-hero-copy-compact">
      <p className="nx-hero-kicker">{t("home.welcome")}</p>

      <h1>
        {t("home.headline")}
        <span>{t("home.headlineAccent")}</span>
      </h1>

      <p className="nx-hero-description">{t("home.description")}</p>

      <div className="nx-hero-actions">
        <Link href="/search" className="nx-primary-action">
          {t("home.shopNow")}
          <ArrowRight />
        </Link>

        <Link href="/search" className="nx-secondary-action">
          {t("home.exploreCategories")}
        </Link>
      </div>
    </div>
  );
}
