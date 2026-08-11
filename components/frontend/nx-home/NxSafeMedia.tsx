import Image from "next/image";
import type { ReactNode } from "react";

type NxSafeMediaProps = {
  src: string | null;
  alt: string;
  fallback: ReactNode;
  sizes: string;
  className?: string;
};

export default function NxSafeMedia({
  src,
  alt,
  fallback,
  sizes,
  className,
}: NxSafeMediaProps) {
  return src ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={className} />
  ) : (
    fallback
  );
}
