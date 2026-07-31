import Image, { type ImageProps } from "next/image";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { cn } from "@/lib/utils";

type LiquidGlassImageProps = ImageProps & {
  wrapperClassName?: string;
};

export function LiquidGlassImage({
  className,
  wrapperClassName,
  alt,
  ...props
}: LiquidGlassImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white bg-transparent shadow-sm backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-inherit before:bg-white/10 before:mix-blend-overlay",
        wrapperClassName
      )}
    >
      <Image
        alt={alt ?? "Image"}
        className={cn("relative z-0 object-cover", className)}
        {...props}
      />
      <NoiseOverlay className="z-20" />
    </div>
  );
}
