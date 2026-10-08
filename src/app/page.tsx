import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />

      {/* Announcement bar */}
      <div className="border-b" style={{ borderColor: "#E5E7EB", backgroundColor: "rgba(243,244,246,0.5)" }}>
        <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex items-center justify-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-white px-2 py-0.5 rounded font-medium" style={{ backgroundColor: "#1A365D" }}>NEW</span>
          <span style={{ color: "#6B7280" }}>AI fit scoring kini tersedia untuk 3 role template creative.</span>
          <Link href="/pricing" className="font-medium hover:underline inline-flex items-center gap-1" style={{ color: "#1A365D" }}>Lihat pricing <span>→</span></Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="max-w-[1280px] mx-auto relative">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs mb-6" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF", color: "#6B7280" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0D9488" }} />
              Dipercaya 180+ perusahaan Indonesia
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-[-0.02em] mb-6">
              Rekrut talent creative<br />
              <span className="italic">dengan bukti nyata</span>, bukan tebak-tebakan.
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-9 leading-relaxed" style={{ color: "#6B7280" }}>
              Platform discovery portfolio-first untuk recruiter yang mencari designer, editor, dan content creative — didukung AI summary dan fit scoring terstruktur.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
              <Link href="/register?role=recruiter" className="inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
                Mulai trial 14 hari gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 12h14"/>
                </svg>
              </Link>
              <Link href="/for-talent" className="inline-flex items-center justify-center gap-2 border px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-80" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
                Daftar sebagai talent
              </Link>
            </div>
            <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Tidak perlu kartu kredit · Batal kapan saja</p>
          </div>

          {/* Split value props */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="border rounded-xl p-8" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(26,54,93,0.1)" }}>
                <svg className="w-5 h-5" style={{ color: "#1A365D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Untuk Recruiter</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>Temukan designer, editor, dan content creative terbaik lewat portfolio nyata. Filter by skill, tools, style, dan lokasi. AI summary membantu shortlist lebih cepat.</p>
              <Link href="/for-recruiters" className="text-sm font-medium hover:underline inline-flex items-center gap-1" style={{ color: "#1A365D" }}>
                Pelajari lebih lanjut →
              </Link>
            </div>
            <div className="border rounded-xl p-8" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(13,148,136,0.1)" }}>
                <svg className="w-5 h-5" style={{ color: "#0D9488" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Untuk Talent Creative</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>Pajang portfolio terbaikmu dalam format recruiter-ready. Ditemukan oleh ratusan perusahaan tanpa harus apply satu-satu. Gratis untuk daftar.</p>
              <Link href="/for-talent" className="text-sm font-medium hover:underline inline-flex items-center gap-1" style={{ color: "#0D9488" }}>
                Buat profile sekarang →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16 border-y" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <p className="text-xs font-mono uppercase tracking-wider mb-8" style={{ color: "#6B7280" }}>Dipercaya oleh tim HR dan Creative di</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            {["Sociolla", "Tokopedia", "Gojek", "Traveloka", "Bukalapak", "Kopi Kenangan"].map(c => (
              <span key={c} className="opacity-60" style={{ color: "#6B7280" }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl tracking-tight mb-4">Kenapa Portora.id?</h2>
            <p className="max-w-xl mx-auto" style={{ color: "#6B7280" }}>Bukan sekadar job portal. Platform khusus untuk tim yang butuh talent creative berkualitas.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14", title: "Portfolio-First", desc: "Lihat karya nyata sebelum baca CV. Thumbnail gallery langsung di search results." },
              { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "AI Summary", desc: "Setiap kandidat punya AI-generated summary kekuatan dan fit terhadap role yang kamu cari." },
              { icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z", title: "Filter Pintar", desc: "Filter by role, skill, tools, lokasi, availability, dan rate. Hasil instan, tanpa noise." },
            ].map(f => (
              <div key={f.title} className="border rounded-xl p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(26,54,93,0.05)" }}>
                  <svg className="w-5 h-5" style={{ color: "#1A365D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-white" style={{ backgroundColor: "#1A365D" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl mb-4">Siap menemukan talent terbaik?</h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>Mulai trial gratis 14 hari. Tidak perlu kartu kredit.</p>
          <Link href="/register?role=recruiter" className="inline-flex items-center gap-2 text-navy px-6 py-3 rounded-lg text-sm font-semibold transition-colors hover:opacity-90" style={{ backgroundColor: "#FFFFFF", color: "#1A365D" }}>
            Mulai sekarang gratis
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
