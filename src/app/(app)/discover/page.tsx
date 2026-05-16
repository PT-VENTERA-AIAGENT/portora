import Link from "next/link";

const MOCK_TALENTS = [
  { username: "rayhan-aditya", name: "Rayhan Aditya", role: "Graphic Designer", location: "Jakarta", experience: "3 tahun", available: true, fitScore: 92, colors: ["from-rose-400 to-purple-500", "from-amber-400 to-red-500", "from-teal-400 to-emerald-600"] },
  { username: "dina-sari", name: "Dina Sari", role: "Video Editor", location: "Bandung", experience: "5 tahun", available: true, fitScore: 88, colors: ["from-blue-400 to-indigo-500", "from-green-400 to-teal-500", "from-pink-400 to-rose-500"] },
  { username: "andi-pratama", name: "Andi Pratama", role: "Social Media Creative", location: "Surabaya", experience: "2 tahun", available: false, fitScore: 85, colors: ["from-yellow-400 to-orange-500", "from-purple-400 to-pink-500", "from-cyan-400 to-blue-500"] },
  { username: "siti-rahma", name: "Siti Rahma", role: "Graphic Designer", location: "Jakarta", experience: "4 tahun", available: true, fitScore: 91, colors: ["from-emerald-400 to-cyan-500", "from-violet-400 to-purple-500", "from-orange-400 to-red-500"] },
  { username: "budi-santoso", name: "Budi Santoso", role: "Video Editor", location: "Yogyakarta", experience: "6 tahun", available: true, fitScore: 87, colors: ["from-red-400 to-pink-500", "from-blue-400 to-cyan-500", "from-green-400 to-emerald-500"] },
  { username: "maya-dewi", name: "Maya Dewi", role: "Social Media Creative", location: "Bali", experience: "3 tahun", available: false, fitScore: 83, colors: ["from-pink-400 to-purple-500", "from-amber-400 to-yellow-500", "from-teal-400 to-green-500"] },
];

const ROLE_TEMPLATES = [
  { role: "Graphic Designer", count: "824", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" },
  { role: "Video Editor", count: "612", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { role: "Social Creative", count: "964", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
];

export default function DiscoverPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: "#6B7280" }}>
            <span>Workspace</span><span>/</span><span style={{ color: "#0A0E1A" }}>Discover</span>
          </div>
          <h1 className="text-3xl font-display tracking-tight">Talent search</h1>
        </div>
      </div>

      {/* Role Template Switcher */}
      <div className="border rounded-xl p-4 mb-4" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
        <p className="text-[10px] font-mono uppercase tracking-wider mb-3" style={{ color: "#6B7280" }}>Role template</p>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_TEMPLATES.map((r, i) => (
            <div key={r.role} className="border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors" style={{
              borderWidth: i === 0 ? 2 : 1,
              borderColor: i === 0 ? "#1A365D" : "#E5E7EB",
              backgroundColor: i === 0 ? "rgba(26,54,93,0.05)" : "#FFFFFF",
            }}>
              <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{
                backgroundColor: i === 0 ? "#1A365D" : "#F3F4F6",
                color: i === 0 ? "#FFFFFF" : "#6B7280",
              }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon}/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{r.role}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{r.count} talents</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 border rounded-lg flex items-center px-4 py-2.5 transition-colors" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <svg className="w-4 h-4 mr-2" style={{ color: "#6B7280" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Cari berdasarkan nama, skill, style, brief…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <button className="text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: "#1A365D" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          AI search
        </button>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm"><span className="font-semibold">1,284</span> <span style={{ color: "#6B7280" }}>talent matched</span></p>
      </div>
      <div className="space-y-3">
        {MOCK_TALENTS.map(t => (
          <Link key={t.username} href={`/talent/${t.username}`} className="border rounded-xl p-4 flex items-center gap-4 transition-colors hover:border-navy block" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ background: "linear-gradient(to bottom right, #1A365D, #0D9488)" }}>
              {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium">{t.name}</p>
                {t.available && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0D9488" }}>Open</span>}
              </div>
              <p className="text-xs" style={{ color: "#6B7280" }}>{t.role} · {t.location} · {t.experience}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {t.colors.map((c, i) => (
                <div key={i} className={`w-10 h-10 rounded-md bg-gradient-to-br ${c}`} />
              ))}
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-[10px]" style={{ color: "#6B7280" }}>Fit score</p>
              <p className="font-mono text-sm font-semibold">{t.fitScore}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
