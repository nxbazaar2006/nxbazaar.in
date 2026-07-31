import * as React from "react";

import { cn } from "@/lib/utils";

type GlassTextVariant = "light" | "dark";
type GlassTextHeadingLevel = "h1" | "h2" | "h3" | "h4";

export type GlassTextProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: GlassTextVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headingAs?: GlassTextHeadingLevel;
  glossyHeroTitle?: boolean;
  headingClassName?: string;
  paragraphClassName?: string;
};

const headingColors: Record<GlassTextVariant, string> = {
  light: "text-slate-950",
  dark: "text-white",
};

const paragraphColors: Record<GlassTextVariant, string> = {
  light: "text-slate-700",
  dark: "text-white/75",
};

const containerColors: Record<GlassTextVariant, string> = {
  light: "border-white/60 bg-white/40",
  dark: "border-white/10 bg-slate-950/30",
};

export function GlassText({
  variant = "light",
  eyebrow,
  title,
  description,
  headingAs: Heading = "h2",
  glossyHeroTitle = false,
  headingClassName,
  paragraphClassName,
  className,
  children,
  ...props
}: GlassTextProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/30 bg-white/15 p-5 shadow-xl backdrop-blur-2xl sm:p-6",
        containerColors[variant],
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-wide",
            paragraphColors[variant],
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <Heading
          className={cn(
            "font-bold tracking-normal",
            glossyHeroTitle
              ? "bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent drop-shadow"
              : headingColors[variant],
            headingClassName,
          )}
        >
          {title}
        </Heading>
      ) : null}
      {description ? (
        <p
          className={cn(
            "mt-2 text-sm leading-6 sm:text-base",
            paragraphColors[variant],
            paragraphClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default GlassText;
