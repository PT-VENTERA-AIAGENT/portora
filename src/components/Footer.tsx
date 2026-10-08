import Link from "next/link";

const LINKS = [
  { href: "/for-recruiters", label: "For Recruiters" },
  { href: "/for-talent", label: "For Talent" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Syarat" },
];

export default function Footer() {
  return (
    <footer className="border-t px-6 py-8" style={{ borderColor: "#E5E7EB" }}>
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#6B7280" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "#1A365D" }}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
            </svg>
          </div>
          <span className="font-medium" style={{ color: "#0A0E1A" }}>Portora.id</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map(l => <Link key={l.href} href={l.href} className="hover:opacity-80 transition-colors">{l.label}</Link>)}
        </nav>
        <p className="font-mono text-xs">© {new Date().getFullYear()} Portora.id by TalentRank</p>
      </div>
    </footer>
  );
}
