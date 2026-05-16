import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Gratis",
      period: "selamanya",
      desc: "Untuk recruiter yang baru mulai eksplorasi.",
      features: ["5 pencarian per bulan", "Lihat profil basic", "1 shortlist", "Email support"],
      cta: "Mulai gratis",
      href: "/discover",
      highlight: false,
    },
    {
      name: "Growth",
      price: "Rp 499K",
      period: "per bulan",
      desc: "Untuk tim HR yang aktif rekrut creative talent.",
      features: ["Pencarian tak terbatas", "AI fit scoring", "Shortlist tak terbatas", "Portfolio full preview", "Priority support", "Export kandidat (CSV)"],
      cta: "Mulai trial 14 hari",
      href: "/discover",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "hubungi kami",
      desc: "Untuk agency dan perusahaan dengan kebutuhan besar.",
      features: ["Semua fitur Growth", "Multi-seat / tim", "ATS integration", "Dedicated account manager", "SLA support", "Custom onboarding"],
      cta: "Hubungi kami",
      href: "/for-recruiters",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />
      <section className="px-6 pt-16 pb-8 text-center">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="font-display text-5xl tracking-tight mb-4">Harga yang transparan</h1>
          <p className="max-w-xl mx-auto" style={{ color: "#6B7280" }}>Mulai gratis, upgrade saat tim butuh lebih banyak. Tidak ada biaya tersembunyi.</p>
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className="rounded-2xl p-8 border" style={{
              backgroundColor: plan.highlight ? "#1A365D" : "#FFFFFF",
              borderColor: plan.highlight ? "#1A365D" : "#E5E7EB",
              color: plan.highlight ? "#FFFFFF" : "#0A0E1A",
            }}>
              <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#6B7280" }}>{plan.name}</p>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm ml-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#6B7280" }}>/{plan.period}</span>
              </div>
              <p className="text-sm mb-6" style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#6B7280" }}>{plan.desc}</p>
              <Link href={plan.href} className="block text-center py-2.5 rounded-lg text-sm font-medium mb-6 transition-colors hover:opacity-90 border" style={{
                backgroundColor: plan.highlight ? "#FFFFFF" : "transparent",
                color: plan.highlight ? "#1A365D" : "#0A0E1A",
                borderColor: plan.highlight ? "#FFFFFF" : "#E5E7EB",
              }}>
                {plan.cta}
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#6B7280" }}>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#0D9488" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
