import type { HTMLAttributes } from "react";

type NoiseOverlayProps = HTMLAttributes<HTMLDivElement>;

/**
 * Subtle reusable texture layer for premium glass and gradient surfaces.
 *
 * Parent elements should establish positioning and clipping, for example:
 * `relative overflow-hidden rounded-xl`.
 */
export function NoiseOverlay({ className, ...props }: NoiseOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "glass-noise pointer-events-none absolute inset-0 rounded-inherit bg-[url('/noise.svg')] bg-repeat mix-blend-soft-light opacity-[0.04]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
