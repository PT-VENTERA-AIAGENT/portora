import { initials } from '@/lib/portora/format'

export default function TalentAvatar({
  name,
  url,
  size = 48,
  rounded = 'rounded-lg',
}: {
  name: string
  url: string | null
  size?: number
  rounded?: string
}) {
  const style = { width: size, height: size }
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${rounded} object-cover flex-shrink-0`} style={style} />
  }
  return (
    <div
      className={`${rounded} flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ ...style, background: 'linear-gradient(to bottom right, #1A365D, #0D9488)', fontSize: Math.max(12, size * 0.32) }}
    >
      {initials(name)}
    </div>
  )
}
