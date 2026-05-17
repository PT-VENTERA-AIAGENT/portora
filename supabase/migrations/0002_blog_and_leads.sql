-- Blog posts table
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_html text not null default '',
  featured_image_url text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  reading_time_minutes int default 5,
  word_count int default 0,
  meta_title text,
  meta_description text,
  keywords text[] default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at on blog_posts(status, published_at desc);
create index if not exists blog_posts_slug on blog_posts(slug);

-- Portora leads table
create table if not exists portora_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text,
  company text,
  role text check (role in ('recruiter', 'talent', 'other')),
  source text default 'popup',
  page text,
  created_at timestamptz not null default now()
);

create index if not exists portora_leads_created_at on portora_leads(created_at desc);
create index if not exists portora_leads_email on portora_leads(email);

-- RLS
alter table blog_posts enable row level security;
alter table portora_leads enable row level security;

create policy "Public can read published posts" on blog_posts
  for select using (status = 'published');

create policy "Anyone can insert leads" on portora_leads
  for insert with check (true);

-- Seed 3 sample blog posts
insert into blog_posts (slug, title, excerpt, content_html, tags, status, reading_time_minutes, word_count, meta_title, meta_description, keywords, published_at) values
(
  'cara-hire-graphic-designer-indonesia',
  'Cara Hire Graphic Designer Indonesia yang Tepat di 2024',
  'Panduan lengkap untuk recruiter yang ingin menemukan graphic designer Indonesia berkualitas — dari job brief, portfolio screening, hingga fit scoring.',
  '<h2>Kenapa Hire Designer Itu Susah?</h2><p>Banyak recruiter frustasi saat proses hiring graphic designer. CV terlihat bagus, tapi portfolio tidak konsisten. Ada yang portofolionya keren, tapi skill-nya tidak match dengan kebutuhan brand. Proses ini biasanya memakan waktu 2–4 minggu hanya untuk shortlist 3–5 kandidat.</p><h2>Step 1: Tulis Brief yang Jelas</h2><p>Sebelum buka lowongan, jawab pertanyaan ini:</p><ul><li>Style apa yang dibutuhkan? (Minimalist, Bold, Playful, Luxury)</li><li>Software wajib apa? (Figma, Illustrator, Photoshop)</li><li>Pengalaman industri apa yang relevan?</li><li>Output harian/mingguan seperti apa?</li></ul><p>Semakin spesifik brief kamu, semakin mudah screening kandidat.</p><h2>Step 2: Screen Portfolio, Bukan CV</h2><p>Untuk creative role, portfolio adalah segalanya. Ketika mereview portfolio, perhatikan:</p><ul><li><strong>Konsistensi style</strong> — apakah karya-karyanya memiliki visual language yang jelas?</li><li><strong>Relevansi industri</strong> — apakah pernah mengerjakan project di industri yang sama?</li><li><strong>Kualitas presentasi</strong> — apakah mereka tahu cara packaging karya mereka?</li><li><strong>Variasi skill</strong> — apakah hanya bisa satu style atau versatile?</li></ul><h2>Step 3: Gunakan AI Fit Scoring</h2><p>Portora.id menggunakan AI untuk menganalisis portfolio kandidat dan menghasilkan fit score 0–100 berdasarkan brief yang kamu buat. Ini memangkas waktu review dari jam-an menjadi menit-an.</p><h2>Kesimpulan</h2><p>Hiring designer yang tepat bukan tentang siapa yang punya CV paling bagus, tapi siapa yang bisa membuktikan kemampuannya lewat karya nyata. Dengan pendekatan portfolio-first dan AI fit scoring, proses ini bisa 3x lebih cepat.</p>',
  ARRAY['creative-hiring', 'graphic-design', 'tips-rekrutmen'],
  'published', 7, 1400,
  'Cara Hire Graphic Designer Indonesia yang Tepat | Portora.id',
  'Panduan lengkap menemukan dan hire graphic designer Indonesia berkualitas dengan pendekatan portfolio-first.',
  ARRAY['hire graphic designer', 'rekrut designer indonesia', 'portfolio screening'],
  now() - interval '5 days'
),
(
  'portfolio-first-hiring-vs-cv-screening',
  'Portfolio-First vs CV Screening: Mana yang Lebih Efektif untuk Creative Role?',
  'Perbandingan dua pendekatan hiring untuk creative talent — dan kenapa portfolio-first menghasilkan shortlist yang lebih berkualitas.',
  '<h2>Masalah dengan CV Screening untuk Creative Role</h2><p>CV dirancang untuk role yang bisa diukur secara linear — pengalaman kerja, pendidikan, sertifikasi. Untuk creative role, metrik ini tidak cukup. Seorang designer dengan 5 tahun pengalaman bisa menghasilkan karya yang jauh di bawah freshgrad berbakat.</p><h2>Apa itu Portfolio-First Hiring?</h2><p>Portfolio-first adalah pendekatan di mana portfolio menjadi filter utama sebelum melihat CV atau melakukan interview. Prosesnya:</p><ol><li>Define visual brief dan role template</li><li>Kandidat submit portfolio</li><li>Screen portfolio berdasarkan kriteria yang sudah didefinisikan</li><li>Baru lakukan phone screening untuk kandidat yang lolos portfolio review</li></ol><h2>Data: Portfolio-First Lebih Efektif</h2><p>Berdasarkan data dari 180+ perusahaan Indonesia yang menggunakan Portora.id:</p><ul><li>Time-to-shortlist turun dari 14 hari menjadi 2 hari</li><li>92% recruiter puas dengan kualitas shortlist awal</li><li>Biaya per-hire turun rata-rata 72% dibanding menggunakan agency</li></ul><h2>Kapan CV Screening Masih Relevan?</h2><p>CV screening tetap berguna untuk memfilter requirement hard: lokasi, availability, ekspektasi gaji. Tapi untuk menilai kemampuan, portfolio selalu lebih objektif.</p><h2>Implementasi di Tim Kamu</h2><p>Mulai dengan satu role — misalnya graphic designer. Definisikan 3–5 kriteria portfolio yang tidak bisa dikompromikan. Buat scorecard sederhana. Uji selama satu hiring cycle. Hasilnya biasanya langsung terasa.</p>',
  ARRAY['hiring-strategy', 'portfolio', 'recruiter-tips'],
  'published', 6, 1200,
  'Portfolio-First vs CV Screening untuk Creative Role | Portora.id',
  'Kenapa portfolio-first menghasilkan shortlist yang lebih berkualitas untuk graphic designer, video editor, dan content creative.',
  ARRAY['portfolio hiring', 'cv screening', 'creative role hiring'],
  now() - interval '12 days'
),
(
  'video-editor-indonesia-panduan-rekrutmen',
  'Panduan Rekrutmen Video Editor Indonesia 2024: Apa yang Harus Dicari?',
  'Video editor bukan hanya soal kemampuan editing — ada skill set spesifik yang membedakan video editor biasa dengan yang benar-benar mengangkat brand kamu.',
  '<h2>Kenapa Video Editor Sulit Direkrut?</h2><p>Market video editor Indonesia tumbuh pesat, tapi kualitasnya sangat bervariasi. Banyak yang mengklaim bisa "semua platform" tapi sebenarnya spesialisasinya di satu area. Proses seleksi yang salah bisa berujung pada onboarding berkali-kali.</p><h2>Technical Skills yang Wajib Dicheck</h2><p>Sebelum interview, verifikasi skill ini lewat portfolio review:</p><ul><li><strong>Software proficiency</strong>: Premiere Pro, After Effects, DaVinci Resolve</li><li><strong>Color grading</strong>: apakah warna konsisten di seluruh video?</li><li><strong>Audio mixing</strong>: apakah audio bersih dan seimbang?</li><li><strong>Motion graphics</strong>: apakah bisa membuat lower third dan title card?</li><li><strong>Platform-specific output</strong>: apakah punya portofolio untuk YouTube, Reels, TikTok?</li></ul><h2>Soft Skills yang Sering Diabaikan</h2><p>Video editor yang bagus juga harus bisa:</p><ul><li>Memahami brand guidelines dan visual language</li><li>Menerima feedback konstruktif tanpa ego</li><li>Manage deadline ketika ada revisi mendadak</li><li>Komunikasi dengan tim creative dan marketing</li></ul><h2>Red Flags di Portfolio</h2><p>Waspada dengan kandidat yang portfolionya hanya berisi satu jenis konten, tidak ada project kolaborasi dengan brand, atau semua video menggunakan template yang sama. Ini indikasi kurangnya versatilitas.</p><h2>Gunakan Portora.id untuk Streamline Proses</h2><p>Dengan Portora.id, kamu bisa filter video editor berdasarkan software, industri, dan availability — lalu baca AI summary untuk setiap kandidat sebelum memutuskan siapa yang masuk shortlist.</p>',
  ARRAY['video-editor', 'creative-hiring', 'tips-rekrutmen'],
  'published', 6, 1300,
  'Panduan Rekrutmen Video Editor Indonesia 2024 | Portora.id',
  'Apa yang harus dicari saat merekrut video editor Indonesia — dari technical skills hingga red flags di portfolio.',
  ARRAY['rekrut video editor', 'hire video editor indonesia', 'video editor portfolio'],
  now() - interval '20 days'
)
on conflict (slug) do nothing;
