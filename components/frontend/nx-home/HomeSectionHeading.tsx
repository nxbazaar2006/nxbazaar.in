"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  sectionKey: string;
  eyebrowKey: string;
  titleKey: string;
  href?: string;
}

export default function HomeSectionHeading({
  sectionKey,
  eyebrowKey,
  titleKey,
  href,
}: Props) {
  const { t } = useTranslation();
  const headingId = `nx-${sectionKey}`;

  return (
    <div className="nx-section-heading">
      <div>
        <span>{t(eyebrowKey)}</span>
        <h2 id={headingId}>{t(titleKey)}</h2>
      </div>

      {href && <Link href={href}>{t("common.viewAll")}</Link>}
    </div>
  );
}
