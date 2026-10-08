import LegalPage, { ContactLine } from '@/components/portora/LegalPage'

export const metadata = {
  title: 'Kebijakan Privasi',
  description: 'Bagaimana Portora.id mengumpulkan, memakai, dan melindungi data pribadi talent dan recruiter.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="7 Oktober 2026">
      <p>
        Portora.id dikelola oleh PT Ventera Indonesia (&ldquo;kami&rdquo;). Kebijakan ini menjelaskan data apa yang kami
        kumpulkan saat kamu memakai Portora.id, untuk apa data itu dipakai, dan hak-hakmu sesuai Undang-Undang Nomor 27
        Tahun 2022 tentang Pelindungan Data Pribadi.
      </p>

      <h2>Data yang kami kumpulkan</h2>
      <ul>
        <li><strong>Akun:</strong> nama, email, password (disimpan terenkripsi oleh penyedia autentikasi), dan peran (talent atau recruiter). Jika masuk dengan Google, kami menerima nama dan email dari Google.</li>
        <li><strong>Profil talent:</strong> role, skill, tools, industri, lokasi, bio, tarif, foto profil, link dan karya portfolio yang kamu unggah.</li>
        <li><strong>Kontak talent:</strong> nomor WhatsApp dan email kontak. Data ini <strong>privat</strong> dan hanya dibuka untuk recruiter yang undangannya kamu terima.</li>
        <li><strong>Profil recruiter:</strong> nama perusahaan, industri, ukuran, website, nama dan WhatsApp PIC.</li>
        <li><strong>Aktivitas:</strong> shortlist, catatan, undangan, jumlah pencarian (untuk kuota paket), serta formulir minta demo atau popup kontak.</li>
        <li><strong>Teknis:</strong> cookie sesi untuk menjaga kamu tetap login. Draf onboarding disimpan sementara di browsermu (local storage) dan dihapus setelah profil dikirim.</li>
      </ul>

      <h2>Untuk apa data dipakai</h2>
      <ul>
        <li>Menampilkan profil talent yang sudah disetujui kepada pengunjung dan recruiter.</li>
        <li>Menjalankan pencarian, shortlist, fit score, dan undangan antara recruiter dan talent.</li>
        <li>Meninjau (memoderasi) profil sebelum tayang.</li>
        <li>Mengirim email layanan, seperti undangan baru, undangan diterima, hasil review profil, dan reset password.</li>
        <li>Menghubungi recruiter yang meminta demo atau upgrade paket.</li>
      </ul>

      <h2>Siapa yang bisa melihat data</h2>
      <ul>
        <li><strong>Publik:</strong> profil talent yang disetujui dan tidak disembunyikan (tanpa kontak).</li>
        <li><strong>Recruiter:</strong> profil talent; kontak talent hanya setelah talent menerima undangan.</li>
        <li><strong>Talent yang diundang:</strong> nama perusahaan, industri, dan WhatsApp PIC recruiter pengundang.</li>
        <li><strong>Tim Portora:</strong> untuk moderasi dan dukungan pelanggan.</li>
      </ul>
      <p>Kami tidak menjual data pribadi.</p>

      <h2>Penyedia layanan</h2>
      <p>
        Kami memakai penyedia infrastruktur untuk menjalankan layanan: penyimpanan database, file, dan autentikasi
        (Supabase), pengiriman email (Resend), dan pembuatan ringkasan profil dengan AI (Anthropic). Untuk ringkasan AI,
        data profil talent yang sudah dikirim untuk review (tanpa kontak) diproses untuk membuat ringkasan singkat bagi
        recruiter. Data dapat diproses di server di luar Indonesia dengan perlindungan yang wajar.
      </p>

      <h2>Penyimpanan &amp; penghapusan</h2>
      <p>
        Data disimpan selama akunmu aktif. Kamu bisa menyembunyikan profil kapan saja dari dashboard, dan menghapus akun
        beserta seluruh profil, karya, kontak, shortlist, dan undangan dari halaman <a href="/account">Akun</a>.
      </p>

      <h2>Hak kamu</h2>
      <p>
        Kamu berhak mengakses, memperbaiki, menghapus, dan menarik persetujuan atas data pribadimu. Sebagian besar bisa
        dilakukan langsung di aplikasi. Untuk permintaan lain, hubungi kami lewat <ContactLine />.
      </p>

      <h2>Perubahan kebijakan</h2>
      <p>Jika kebijakan ini berubah secara material, kami akan memberi tahu lewat situs atau email.</p>
    </LegalPage>
  )
}
