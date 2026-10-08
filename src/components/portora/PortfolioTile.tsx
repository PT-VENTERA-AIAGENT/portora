import type { PortfolioItem } from '@/lib/supabase/types'

const ICONS = {
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
}

export default function PortfolioTile({ item, showTitle = true }: { item: Pick<PortfolioItem, 'title' | 'media_url' | 'media_type' | 'link_url'>; showTitle?: boolean }) {
  const href = item.link_url ?? item.media_url ?? undefined
  const body = item.media_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[item.media_type]} />
      </svg>
    </div>
  )

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="aspect-square rounded-xl overflow-hidden border relative" style={{ borderColor: '#E5E7EB' }}>
        {body}
        {item.media_type !== 'image' && item.media_url && (
          <span className="absolute top-2 left-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: 'rgba(10,14,26,0.7)' }}>
            {item.media_type}
          </span>
        )}
      </div>
      {showTitle && <p className="text-xs mt-1.5 truncate group-hover:underline" style={{ color: '#0A0E1A' }}>{item.title}</p>}
    </a>
  )
}
