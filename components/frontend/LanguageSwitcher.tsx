"use client";

import { ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { useTranslation } from "@/hooks/useTranslation";
import {
  languageOptions,
  normalizeLanguage,
  supportedLanguages,
  type LanguageCode,
} from "@/lib/i18n/languages";

function replaceLanguageSegment(pathname: string, language: LanguageCode) {
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (supportedLanguages.includes(firstSegment as LanguageCode)) {
    segments[1] = language;
    return segments.join("/") || `/${language}`;
  }

  return pathname;
}

export type LanguageSwitcherProps = {
  localizedRoutes?: Partial<Record<LanguageCode, string>>;
};

export default function LanguageSwitcher({
  localizedRoutes,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useTranslation();
  const currentOption =
    languageOptions.find((option) => option.code === language) ??
    languageOptions[0];

  function selectLanguage(next: string) {
    const nextLanguage = normalizeLanguage(next);
    setLanguage(nextLanguage);

    const nextPath =
      localizedRoutes?.[nextLanguage] ??
      replaceLanguageSegment(pathname, nextLanguage);

    if (nextPath !== pathname) {
      router.push(nextPath);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><LiquidGlassButton
          type="button"
          size="sm"
          variant="neutral"
          leftIcon={<Languages />}
          rightIcon={<ChevronDown />}
        >
          {currentOption.nativeLabel}
        </LiquidGlassButton></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="liquid-card min-w-40 p-2">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => selectLanguage(option.code)}
            className="cursor-pointer rounded-xl text-white focus:bg-white/15 focus:text-white"
          >
            <span className="font-medium">{option.nativeLabel}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
