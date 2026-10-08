import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = ["", "/for-recruiters", "/for-talent", "/pricing", "/blog", "/privacy", "/terms"].map(path => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Tanpa cookie: hanya data publik (RLS: blog published & profil talent approved).
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const [{ data: posts }, { data: talents }] = await Promise.all([
    supabase.from("blog_posts").select("slug, updated_at, published_at").eq("status", "published"),
    supabase.from("portora_talent_profiles").select("username, updated_at").eq("status", "approved").eq("is_public", true).limit(5000),
  ]);

  return [
    ...staticPages,
    ...(posts ?? []).map(p => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.updated_at ?? p.published_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(talents ?? []).map(t => ({
      url: `${siteUrl}/talent/${t.username}`,
      lastModified: t.updated_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
