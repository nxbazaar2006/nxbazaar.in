"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export type DashboardActionButtonProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "onClick"
> & {
  label: string;
  icon: React.ReactNode;
  variant?: "primary" | "success";
  loading?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  href?: string;
};

export const DashboardActionButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  DashboardActionButtonProps
>(
  (
    {
      label,
      icon,
      variant = "primary",
      loading = false,
      disabled = false,
      onClick,
      type = "button",
      className,
      href,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const variantClass =
      variant === "success" ? "liquid-glass-success" : "liquid-glass-primary";
    const classes = cn(
      "dashboard-submit-action liquid-glass-control mt-0 flex min-h-11 shrink-0 items-center gap-2.5 rounded-full py-1 pl-4 pr-1 font-semibold !text-white [&_*]:!text-white [&_svg]:!stroke-white",
      variantClass,
      className,
    );
    const handleClick: React.MouseEventHandler<
      HTMLButtonElement | HTMLAnchorElement
    > = (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };
    const content = (
      <>
        <span
          className="liquid-glass-inner pointer-events-none"
          aria-hidden="true"
        />
        <span className="liquid-glass-content text-sm font-semibold text-white">
          {label}
        </span>
        <span className="liquid-glass-content grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            icon
          )}
        </span>
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={isDisabled || undefined}
          data-disabled={isDisabled ? "true" : undefined}
          onClick={handleClick}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-disabled={isDisabled ? "true" : undefined}
        onClick={handleClick}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

DashboardActionButton.displayName = "DashboardActionButton";

export default DashboardActionButton;
