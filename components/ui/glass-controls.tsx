import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type GlassButtonProps = ButtonProps;
export type GlassInputProps = React.ComponentPropsWithoutRef<typeof Input>;
export type GlassSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function GlassButton({ className, ...props }: GlassButtonProps) {
  return (
    <Button
      className={cn("dashboard-glass-button", className)}
      {...props}
    />
  );
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, ...props }, ref) => (
    <Input ref={ref} className={cn("dashboard-glass-input", className)} {...props} />
  ),
);
GlassInput.displayName = "GlassInput";

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn("dashboard-glass-select", className)}
      {...props}
    >
      {children}
    </select>
  ),
);
GlassSelect.displayName = "GlassSelect";
