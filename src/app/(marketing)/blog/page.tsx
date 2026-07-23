import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog Creative Hiring | Portora.id — Tips Rekrutmen Designer & Video Editor',
  description: 'Artikel tentang cara rekrut graphic designer, video editor, dan content creative Indonesia. Tips portfolio-first hiring, AI fit scoring, dan talent discovery.',
  keywords: ['blog creative hiring', 'rekrut designer', 'hire video editor', 'tips hr indonesia', 'portora blog'],
  openGraph: {
    title: 'Blog Creative Hiring | Portora.id',
    description: 'Panduan dan tips rekrutmen creative talent Indonesia.',
    type: 'website',
    url: 'https://portora.id/blog',
  },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <section className="px-6 pt-16 pb-10 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-[1280px] mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider mb-3 block" style={{ color: '#0D9488' }}>Blog</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ color: '#0A0E1A' }}>
            Creative hiring insights.
          </h1>
          <p className="text-base max-w-xl" style={{ color: '#6B7280' }}>
            Panduan praktis merekrut graphic designer, video editor, dan content creative Indonesia — berbasis data nyata dari 180+ perusahaan.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-[1280px] mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm font-mono" style={{ color: '#9CA3AF' }}>Artikel segera hadir.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    {post.featuredImage && (
                      <div className="rounded-xl overflow-hidden mb-4 aspect-[16/9]" style={{ backgroundColor: '#F3F4F6' }}>
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    {!post.featuredImage && (
                      <div className="rounded-xl mb-4 aspect-[16/9] flex items-center justify-center" style={{ backgroundColor: '#F0FDF9' }}>
                        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#0D9488' }}>{post.category}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(13,148,136,0.08)', color: '#0D9488' }}>
                        {post.category}
                      </span>
                      <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{post.readingTime} min read</span>
                    </div>
                    <h2 className="font-semibold text-lg leading-snug mb-2 group-hover:underline underline-offset-2" style={{ color: '#0A0E1A' }}>
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>
                      {post.excerpt}
                    </p>
                    <div className="mt-4 text-xs font-mono" style={{ color: '#9CA3AF' }}>
                      {new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inline lead capture */}
      <section className="px-6 py-16 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0A0E1A' }}>Mau shortlist designer lebih cepat?</h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Coba Portora.id gratis — 1,200+ portfolio creative talent Indonesia, AI fit scoring, shortlist dalam 2 hari.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1A365D' }}
          >
            Mulai gratis sekarang →
          </Link>
        </div>
      </section>
    </>
  );
}
