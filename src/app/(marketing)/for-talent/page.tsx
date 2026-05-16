import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ForTalentPage() {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />
      <section className="px-6 pt-20 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider mb-4 block" style={{ color: "#0D9488" }}>For Talent</span>
            <h1 className="font-display text-5xl tracking-tight mb-6">Pajang karya. Ditemukan recruiter.</h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#6B7280" }}>Buat public profile yang recruiter-ready dalam 10 menit. Upload portfolio, tambah skills, dan mulai ditemukan oleh ratusan perusahaan Indonesia. Gratis.</p>
            <Link href="/onboarding" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#0D9488" }}>
              Buat profile sekarang — Gratis
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-3 gap-6">
          {[
            { title: "Graphic Designer", count: "824 talent terdaftar", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" },
            { title: "Video Editor", count: "612 talent terdaftar", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
            { title: "Social Media Creative", count: "964 talent terdaftar", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
          ].map(r => (
            <div key={r.title} className="border rounded-xl p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(13,148,136,0.1)" }}>
                <svg className="w-5 h-5" style={{ color: "#0D9488" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon}/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">{r.title}</h3>
              <p className="text-xs font-mono" style={{ color: "#6B7280" }}>{r.count}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 text-white" style={{ backgroundColor: "#0D9488" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl mb-4">Mulai dalam 10 menit</h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>Isi profile, upload portfolio, dan langsung bisa ditemukan recruiter. 100% gratis untuk talent.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors hover:opacity-90" style={{ backgroundColor: "#FFFFFF", color: "#0D9488" }}>
            Daftar gratis sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
