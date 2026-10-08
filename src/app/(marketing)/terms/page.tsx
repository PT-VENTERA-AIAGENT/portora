import LegalPage, { ContactLine } from '@/components/portora/LegalPage'

export const metadata = {
  title: 'Syarat Layanan',
  description: 'Syarat dan ketentuan penggunaan Portora.id untuk talent dan recruiter.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Syarat Layanan" updated="7 Oktober 2026">
      <p>
        Dengan membuat akun atau memakai Portora.id, kamu menyetujui syarat berikut. Portora.id dikelola oleh PT Ventera
        Indonesia (&ldquo;kami&rdquo;).
      </p>

      <h2>Akun</h2>
      <ul>
        <li>Kamu bertanggung jawab atas keakuratan data dan kerahasiaan password akunmu.</li>
        <li>Satu akun dipakai oleh satu orang. Akun talent mewakili dirimu sendiri; akun recruiter mewakili perusahaan yang kamu cantumkan.</li>
      </ul>

      <h2>Talent</h2>
      <ul>
        <li>Karya yang kamu unggah harus karyamu sendiri, atau kamu punya izin untuk menampilkannya. Hormati kerahasiaan klien.</li>
        <li>Hak cipta karya tetap milikmu. Kamu memberi kami izin untuk menampilkan karya tersebut di Portora.id selama profilmu aktif.</li>
        <li>Profil ditinjau sebelum tayang. Kami dapat meminta perbaikan, menolak, atau menurunkan profil yang tidak sesuai.</li>
      </ul>

      <h2>Recruiter</h2>
      <ul>
        <li>Data kontak talent hanya boleh dipakai untuk menawarkan pekerjaan atau proyek yang sah, bukan untuk spam atau dijual kembali.</li>
        <li>Jangan meminta biaya apa pun dari talent sebagai syarat rekrutmen.</li>
      </ul>

      <h2>Paket &amp; pembayaran</h2>
      <ul>
        <li>Recruiter baru mendapat trial paket Growth selama 14 hari tanpa kartu kredit. Setelah trial, akun kembali ke paket Starter (gratis) kecuali diperpanjang.</li>
        <li>Batasan setiap paket mengikuti halaman <a href="/pricing">Pricing</a>. Aktivasi paket berbayar dilakukan bersama tim kami.</li>
      </ul>

      <h2>Larangan</h2>
      <ul>
        <li>Mengunggah konten yang melanggar hukum, menyesatkan, atau melanggar hak pihak lain.</li>
        <li>Mengambil data secara otomatis (scraping) atau mengganggu keamanan layanan.</li>
      </ul>

      <h2>Batasan tanggung jawab</h2>
      <p>
        Portora.id mempertemukan talent dan recruiter. Kesepakatan kerja, pembayaran, dan hasil proyek adalah tanggung
        jawab masing-masing pihak. Fit score dan ringkasan AI adalah alat bantu, bukan jaminan kualitas.
      </p>

      <h2>Penghentian</h2>
      <p>
        Kamu bisa menghapus akun kapan saja dari halaman <a href="/account">Akun</a>. Kami dapat menangguhkan akun yang
        melanggar syarat ini.
      </p>

      <h2>Hukum yang berlaku</h2>
      <p>Syarat ini diatur oleh hukum Republik Indonesia. Pertanyaan dapat disampaikan lewat <ContactLine />.</p>
    </LegalPage>
  )
}
