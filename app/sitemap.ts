import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/batches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blogs`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/admission`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const result = await query("SELECT id, created_at FROM blogs ORDER BY created_at DESC");
    const blogRoutes: MetadataRoute.Sitemap = result.rows.map((row: { id: number; created_at: string }) => ({
      url: `${baseUrl}/blogs/${row.id}`,
      lastModified: new Date(row.created_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
