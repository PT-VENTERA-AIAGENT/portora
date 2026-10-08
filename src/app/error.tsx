"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl tracking-tight mb-3" style={{ color: "#0A0E1A" }}>Terjadi kesalahan</h1>
        <p className="text-sm mb-2" style={{ color: "#6B7280" }}>Maaf, halaman ini gagal dimuat. Coba lagi beberapa saat lagi.</p>
        {error.digest && <p className="font-mono text-[11px] mb-6" style={{ color: "#6B7280" }}>Kode: {error.digest}</p>}
        <div className="flex justify-center gap-2">
          <button onClick={reset} className="text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>Coba lagi</button>
          <Link href="/" className="border px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-80" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>Ke beranda</Link>
        </div>
      </div>
    </main>
  );
}
