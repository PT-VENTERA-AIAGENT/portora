const MOCK_DATA: Record<string, { name: string; role: string; location: string; bio: string; skills: string[]; available: boolean }> = {
  "rayhan-aditya": {
    name: "Rayhan Aditya",
    role: "Graphic Designer",
    location: "Jakarta",
    bio: "Designer dengan 3 tahun pengalaman di branding dan social media. Spesialisasi beauty brand dan lifestyle.",
    skills: ["Adobe Illustrator", "Figma", "Branding", "Social Media Design", "Motion Graphics"],
    available: true,
  },
  "dina-sari": {
    name: "Dina Sari",
    role: "Video Editor",
    location: "Bandung",
    bio: "Video editor berpengalaman 5 tahun di konten digital. Spesialisasi short-form video dan reels.",
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Color Grading", "Reels"],
    available: true,
  },
};

export default function TalentProfilePage({ params }: { params: { username: string } }) {
  const talent = MOCK_DATA[params.username] ?? {
    name: params.username.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
    role: "Creative Talent",
    location: "Indonesia",
    bio: "Creative talent di Portora.id.",
    skills: ["Design", "Creative"],
    available: true,
  };

  const portfolioColors = [
    "from-rose-400 to-purple-500",
    "from-amber-400 to-red-500",
    "from-teal-400 to-emerald-600",
    "from-blue-400 to-indigo-500",
    "from-pink-400 to-rose-500",
    "from-green-400 to-teal-500",
  ];

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1">
          <div className="border rounded-2xl p-6 sticky top-24" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ background: "linear-gradient(to bottom right, #1A365D, #0D9488)" }}>
              {talent.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <h1 className="text-xl font-semibold mb-0.5">{talent.name}</h1>
            <p className="text-sm mb-1" style={{ color: "#6B7280" }}>{talent.role}</p>
            <p className="text-xs font-mono mb-4" style={{ color: "#6B7280" }}>{talent.location}</p>
            {talent.available && (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-4" style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0D9488" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0D9488" }} />
                Open to work
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {talent.skills.map((s: string) => (
                <span key={s} className="text-[11px] border rounded-md px-2 py-0.5" style={{ borderColor: "#E5E7EB", backgroundColor: "#F3F4F6", color: "#6B7280" }}>{s}</span>
              ))}
            </div>
            <button className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
              Hubungi talent
            </button>
          </div>
        </aside>
        <div className="md:col-span-2">
          <div className="border rounded-2xl p-6 mb-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <h2 className="font-semibold mb-3">Tentang</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{talent.bio}</p>
          </div>
          <div className="border rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <h2 className="font-semibold mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {portfolioColors.map((c, i) => (
                <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${c}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
