import "./globals.css";

import Providers from "@/context/Providers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.in",
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
