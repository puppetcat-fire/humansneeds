import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { listWishClusters } from "@/lib/wishes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { wishes } = await listWishClusters();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/manifesto`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/wishes`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
  ];

  const wishRoutes: MetadataRoute.Sitemap = wishes.map((wish) => ({
    url: `${siteUrl}/wishes/${wish.slug}`,
    lastModified: new Date(wish.latestAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...wishRoutes];
}
