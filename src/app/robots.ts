import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Area login tidak perlu diindeks.
      disallow: ["/admin", "/dashboard", "/onboarding", "/discover", "/shortlists", "/invites", "/company", "/account", "/welcome", "/auth", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
