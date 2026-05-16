import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ backgroundColor: "rgba(250,250,247,0.9)", borderColor: "#E5E7EB" }}>
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "#1A365D" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight leading-none" style={{ color: "#0A0E1A" }}>Portora.id</p>
              <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: "#6B7280" }}>by TalentRank</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            <Link href="/for-recruiters" className="px-3 py-1.5 transition-colors hover:opacity-80" style={{ color: "#6B7280" }}>For Recruiters</Link>
            <Link href="/for-talent" className="px-3 py-1.5 transition-colors hover:opacity-80" style={{ color: "#6B7280" }}>For Talent</Link>
            <Link href="/pricing" className="px-3 py-1.5 transition-colors hover:opacity-80" style={{ color: "#6B7280" }}>Pricing</Link>
            <Link href="/discover" className="px-3 py-1.5 transition-colors hover:opacity-80" style={{ color: "#6B7280" }}>Talent Search</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden md:inline-flex px-3 py-2 text-sm transition-colors hover:opacity-80" style={{ color: "#6B7280" }}>Log in</Link>
          <Link href="/discover" className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
            Start free trial
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 12h14"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
