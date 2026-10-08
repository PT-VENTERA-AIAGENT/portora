import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.seo.title.includes('Portora.id') ? { absolute: post.seo.title } : post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://portora.id/blog/${post.slug}`,
      ...(post.featuredImage ? { images: [{ url: post.featuredImage }] } : {}),
    },
    alternates: { canonical: `https://portora.id/blog/${post.slug}` },
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getBlogPost(slug), getAllBlogPosts()]);
  if (!post) notFound();

  const related = allPosts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 2);

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'Portora.id' },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    publisher: { '@type': 'Organization', name: 'Portora.id by TalentRank' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://portora.id/blog/${post.slug}` },
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />

      <div className="px-6 py-14">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-16">

            {/* Article */}
            <article>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-mono mb-8" style={{ color: '#9CA3AF' }}>
                <Link href="/blog" className="hover:underline" style={{ color: '#0D9488' }}>Blog</Link>
                <span>/</span>
                <span className="truncate max-w-[200px]">{post.title}</span>
              </div>

              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(13,148,136,0.08)', color: '#0D9488' }}>
                    {post.category}
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{post.readingTime} min read</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: '#0A0E1A' }}>{post.title}</h1>
                <p className="text-base" style={{ color: '#6B7280' }}>{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-5 pt-5 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#0D9488' }}>P</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0A0E1A' }}>Portora.id</p>
                    <p className="text-xs font-mono" style={{ color: '#9CA3AF' }}>
                      {new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {post.featuredImage && (
                <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]" style={{ backgroundColor: '#F3F4F6' }}>
                  <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div
                className="prose-portora"
                style={{ color: '#374151', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full border" style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Lead capture card */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#0D9488' }}>Gratis · Langsung aktif</p>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#0A0E1A' }}>Temukan creative talent lebih cepat</h3>
                <p className="text-sm mb-5" style={{ color: '#6B7280' }}>1,200+ portfolio designer, editor, dan creative Indonesia. AI fit scoring. Shortlist dalam 2 hari.</p>
                <Link
                  href="/register"
                  className="block text-center text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#1A365D' }}
                >
                  Mulai gratis →
                </Link>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>Artikel terkait</p>
                  <div className="space-y-4">
                    {related.map(p => (
                      <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                        <p className="text-sm font-medium group-hover:underline underline-offset-2" style={{ color: '#0A0E1A' }}>{p.title}</p>
                        <p className="text-xs font-mono mt-1" style={{ color: '#9CA3AF' }}>{p.readingTime} min read</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to blog */}
              <Link href="/blog" className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: '#0D9488' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Semua artikel
              </Link>
            </aside>
          </div>

          {/* Related posts bottom (mobile) */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="font-bold text-xl mb-8" style={{ color: '#0A0E1A' }}>Artikel terkait</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {related.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group block p-6 rounded-2xl border hover:border-teal-200 transition-colors" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                    <span className="text-xs font-mono mb-2 block" style={{ color: '#0D9488' }}>{p.category}</span>
                    <h3 className="font-semibold mb-2 group-hover:underline underline-offset-2" style={{ color: '#0A0E1A' }}>{p.title}</h3>
                    <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline CTA */}
      <div className="px-6 py-14 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0A0E1A' }}>Siap coba portfolio-first hiring?</h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Daftar gratis — tidak butuh kartu kredit.</p>
          <Link href="/register" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A365D' }}>
            Mulai trial 14 hari gratis →
          </Link>
        </div>
      </div>
    </>
  );
}
