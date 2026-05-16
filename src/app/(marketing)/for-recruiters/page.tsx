import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ForRecruitersPage() {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />
      <section className="px-6 pt-20 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider mb-4 block" style={{ color: "#0D9488" }}>For Recruiters</span>
            <h1 className="font-display text-5xl tracking-tight mb-6">Shortlist talent creative 3x lebih cepat</h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#6B7280" }}>Portora.id memberi recruiter satu tempat untuk search, screen, dan shortlist designer, editor, dan content creative terbaik Indonesia.</p>
            <Link href="/discover" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
              Coba gratis 14 hari
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 py-16 border-y" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-3 gap-8">
          {[
            { stat: "1,200+", label: "Talent verified", desc: "Portfolio terverifikasi oleh tim kurasi Portora" },
            { stat: "3x", label: "Lebih cepat shortlist", desc: "Dibanding proses manual buka portfolio satu-satu" },
            { stat: "92%", label: "Satisfaction rate", desc: "Recruiter puas dengan kualitas kandidat yang ditemukan" },
          ].map(s => (
            <div key={s.stat} className="text-center">
              <p className="text-4xl font-bold mb-1 font-mono" style={{ color: "#1A365D" }}>{s.stat}</p>
              <p className="font-semibold mb-1">{s.label}</p>
              <p className="text-sm" style={{ color: "#6B7280" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Lead capture form */}
      <section className="px-6 py-20">
        <div className="max-w-lg mx-auto border rounded-2xl p-8" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <h2 className="font-display text-2xl mb-2">Minta demo</h2>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>Kami akan hubungi dalam 1 hari kerja.</p>
          <RecruiterLeadForm />
        </div>
      </section>
    </div>
  );
}

function RecruiterLeadForm() {
  return (
    <form className="space-y-4" action="/api/recruiter-lead" method="post">
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>Nama lengkap</label>
        <input name="name" type="text" required placeholder="Budi Santoso" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-navy" style={{ borderColor: "#E5E7EB" }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>Perusahaan</label>
        <input name="company" type="text" required placeholder="PT Contoh Digital" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: "#E5E7EB" }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>Email</label>
        <input name="email" type="email" required placeholder="budi@perusahaan.com" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: "#E5E7EB" }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>WhatsApp</label>
        <input name="whatsapp" type="tel" placeholder="08123456789" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: "#E5E7EB" }} />
      </div>
      <button type="submit" className="w-full text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
        Minta demo gratis
      </button>
    </form>
  );
}
