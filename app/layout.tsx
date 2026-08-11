import "./globals.css";

import Providers from "@/context/Providers";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in",
  ),
  title: {
    default: "Nxbazaar.in | Multi-vendor Ecommerce Marketplace",
    template: "%s | Nxbazaar.in",
  },
  description:
    "Shop products from verified sellers on Nxbazaar.in, a multilingual multi-vendor ecommerce marketplace with GST-ready ordering.",
  applicationName: "Nxbazaar.in",
  keywords: [
    "Nxbazaar.in",
    "marketplace",
    "multi-vendor ecommerce",
    "GST invoice",
    "online shopping",
  ],
  openGraph: {
    title: "Nxbazaar.in",
    description:
      "A premium multi-vendor ecommerce marketplace for customers, sellers and admins.",
    siteName: "Nxbazaar.in",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nxbazaar.in",
    description: "Shop products from verified sellers on Nxbazaar.in.",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}