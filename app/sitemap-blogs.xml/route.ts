import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";

  const blogs = await db.blog.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const vlogs = await db.vlog.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const blogUrls = blogs
    .map(
      (b) => `
    <url>
      <loc>${baseUrl}/blogs/${b.slug}</loc>
      <lastmod>${new Date(b.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join("");

  const vlogUrls = vlogs
    .map(
      (v) => `
    <url>
      <loc>${baseUrl}/vlogs/${v.slug}</loc>
      <lastmod>${new Date(v.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/vlogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${blogUrls}
  ${vlogUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
