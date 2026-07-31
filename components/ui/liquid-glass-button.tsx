"use client";

import { cn } from "@/lib/utils";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

const liquidGlassButtonVariants = cva(
  [
    "liquid-glass-control inline-flex items-center justify-center rounded-full font-semibold tracking-normal text-inherit",
    "select-none whitespace-nowrap outline-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_*]:text-inherit [&_svg]:text-inherit [&_svg]:stroke-current",
    "[&_.liquid-glass-icon]:shrink-0 [&_.liquid-glass-icon>svg]:h-4 [&_.liquid-glass-icon>svg]:w-4",
  ],
  {
    variants: {
      variant: {
        primary: "liquid-glass-primary",
        secondary: "liquid-glass-secondary",
        cyan: "liquid-glass-cyan",
        success: "liquid-glass-success text-white hover:text-white",
        neutral: "liquid-glass-neutral",
        danger: "liquid-glass-danger",
        ghost: "liquid-glass-ghost",
      },
      size: {
        sm: "min-h-10 gap-2 px-4 py-2 text-xs",
        md: "min-h-12 gap-2.5 px-5 py-2.5 text-sm",
        lg: "min-h-14 gap-2.5 px-7 py-3 text-base",
        xl: "min-h-16 gap-3 px-9 py-4 text-lg",
        icon: "min-h-11 min-w-11 gap-0 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      iconOnly: {
        true: "aspect-square",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      iconOnly: false,
    },
  },
);

export type LiquidGlassButtonVariantProps = VariantProps<
  typeof liquidGlassButtonVariants
>;
export type LiquidGlassVariant = NonNullable<
  LiquidGlassButtonVariantProps["variant"]
>;
export type LiquidGlassSize = NonNullable<LiquidGlassButtonVariantProps["size"]>;

export type LiquidGlassButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children" | "disabled" | "type" | "onClick"
> & {
  children?: React.ReactNode;
  variant?: LiquidGlassVariant;
  size?: LiquidGlassSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  asChild?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function liquidGlassClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  className,
}: {
  variant?: LiquidGlassVariant;
  size?: LiquidGlassSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return cn(
    liquidGlassButtonVariants({
      variant,
      size: iconOnly ? "icon" : size,
      fullWidth,
      iconOnly,
    }),
    className,
    variant === "success" &&
      "text-white hover:text-white [&_*]:text-white [&_svg]:text-white [&_svg]:stroke-white",
  );
}

function getSingleElementChild(children: React.ReactNode) {
  const meaningfulChildren = React.Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim().length > 0,
  );

  return meaningfulChildren[0] ?? null;
}

export const LiquidGlassButton = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      disabled = false,
      fullWidth = false,
      iconOnly = false,
      asChild = false,
      className,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const slottableChild = asChild ? getSingleElementChild(children) : children;

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        disabled={asChild ? undefined : isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-disabled={isDisabled ? "true" : undefined}
        onClick={handleClick}
        className={liquidGlassClassName({
          variant,
          size,
          fullWidth,
          iconOnly,
          className,
        })}
        {...props}
      >
        <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
        {loading ? (
          <span className="liquid-glass-icon liquid-glass-content flex shrink-0 items-center text-inherit">
            <LoaderCircle className="animate-spin text-inherit" aria-hidden="true" />
          </span>
        ) : (
          leftIcon && (
            <span className="liquid-glass-icon liquid-glass-content flex shrink-0 items-center text-inherit">
              {leftIcon}
            </span>
          )
        )}
        {asChild ? (
          <Slottable>{slottableChild}</Slottable>
        ) : (
          <span className="liquid-glass-label liquid-glass-content min-w-0 truncate text-inherit">
            {children}
          </span>
        )}
        {!loading && rightIcon && (
          <span className="liquid-glass-icon liquid-glass-content flex shrink-0 items-center text-inherit">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  },
);

LiquidGlassButton.displayName = "LiquidGlassButton";
