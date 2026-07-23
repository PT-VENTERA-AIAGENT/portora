import { createClient } from '@/lib/supabase/client';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  readingTime: number;
  wordCount: number;
  publishedAt: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

function mapPost(post: Record<string, unknown>): BlogPost {
  return {
    slug: post.slug as string,
    title: post.title as string,
    excerpt: (post.excerpt as string) || '',
    content: (post.content_html as string) || '',
    featuredImage: (post.featured_image_url as string | undefined),
    tags: (post.tags as string[]) || [],
    category: ((post.tags as string[])?.[0]) || 'Creative Hiring',
    readingTime: (post.reading_time_minutes as number) || 5,
    wordCount: (post.word_count as number) || 0,
    publishedAt: new Date((post.published_at as string) || (post.created_at as string)).toISOString().split('T')[0],
    seo: {
      title: (post.meta_title as string) || (post.title as string),
      description: (post.meta_description as string) || (post.excerpt as string) || '',
      keywords: (post.keywords as string[]) || [],
    },
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  return mapPost(data);
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter(p => p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
}
