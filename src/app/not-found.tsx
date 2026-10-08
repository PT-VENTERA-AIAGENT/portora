import Link from "next/link";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FAFAF7" }}>
      <div className="max-w-md text-center">
        <p className="font-mono text-sm mb-3" style={{ color: "#6B7280" }}>404</p>
        <h1 className="font-display text-4xl tracking-tight mb-3" style={{ color: "#0A0E1A" }}>Halaman tidak ditemukan</h1>
        <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
          Link ini mungkin salah ketik, sudah dipindahkan, atau profilnya belum dipublikasikan.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/" className="text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>Ke beranda</Link>
          <Link href="/blog" className="border px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-80" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>Baca blog</Link>
        </div>
      </div>
    </main>
  );
}
