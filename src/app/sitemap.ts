import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chamber-seven-omega.vercel.app";

const PUBLIC_ROUTES = ["/", "/career", "/changelog", "/leaderboard", "/lessons", "/tutorial"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
