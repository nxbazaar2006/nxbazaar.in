"use client";
import { LiquidGlassButton, type LiquidGlassButtonProps,
} from "@/components/ui/liquid-glass-button";
export type LiquidGlassIconButtonProps = Omit< LiquidGlassButtonProps, "iconOnly" | "size"
>;
export function LiquidGlassIconButton(props: LiquidGlassIconButtonProps) { return <LiquidGlassButton {...props} iconOnly size="icon" />;
}
