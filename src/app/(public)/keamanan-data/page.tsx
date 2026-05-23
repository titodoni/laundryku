import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Keamanan Data — LaundryKU",
  description: "Informasi keamanan data dan infrastruktur platform LaundryKU.",
};

export default function KeamananDataPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Informasi Keamanan Data</h1>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: 22 Mei 2026</p>
          </div>
        </div>

        <article className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">1. Enkripsi & Transmisi Data</h2>
            <p className="mt-2">
              Seluruh komunikasi antara perangkat Anda dan server LaundryKU dienkripsi menggunakan
              protokol <strong>TLS 1.3</strong> (HTTPS). Data sensitif seperti token autentikasi dan
              informasi pembayaran dienkripsi dengan algoritma AES-256 baik saat transit maupun saat
              disimpan (at-rest). Kami menggunakan sertifikat SSL dari otoritas sertifikat terpercaya.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">2. Infrastruktur Cloud</h2>
            <p className="mt-2">
              LaundryKU dihosting di infrastruktur cloud terkemuka dengan sertifikasi keamanan internasional.
              Server kami berlokasi di pusat data dengan kontrol akses fisik ketat, sistem pemadam kebakaran,
              dan pasokan listrik redundan. Arsitektur kami menggunakan isolasi tenant, memastikan data
              satu toko tidak dapat diakses oleh toko lain.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">3. Akses Terbatas & Autentikasi</h2>
            <p className="mt-2">
              Akses ke data pelanggan oleh tim internal LaundryKU sangat terbatas dan hanya diberikan
              berdasarkan kebutuhan (prinsip least privilege). Seluruh akses internal memerlukan
              autentikasi multi-faktor (MFA). Setiap aktivitas akses data sensitif dicatat dalam log
              audit yang tidak dapat dimodifikasi.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">4. Backup & Recovery</h2>
            <p className="mt-2">
              Kami melakukan backup otomatis data secara berkala dengan cadangan di lokasi terpisah
              (off-site). Dalam keadaan darurat, kami dapat merestorasi data ke titik waktu tertentu
              (point-in-time recovery). Target waktu pemulihan (RTO) dan target titik pemulihan (RPO)
              kami dirancang untuk meminimalkan gangguan bisnis Anda.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">5. Keamanan Fisik</h2>
            <p className="mt-2">
              Pusat data tempat server kami berada dilengkapi dengan: pengawasan CCTV 24 jam, kontrol
              akses biometrik, penjagaan keamanan fisik, serta pemisahan zona jaringan (network segmentation)
              untuk mencegah akses tidak sah dari jaringan publik.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">6. Kepatuhan & Standar</h2>
            <p className="mt-2">
              Kami berkomitmen mematuhi regulasi perlindungan data yang berlaku di Indonesia, termasuk
              Peraturan Menteri Komunikasi dan Informatika tentang Perlindungan Data Pribadi. Kami secara
              rutin melakukan penilaian keamanan internal dan mengevaluasi kelayakan kontrol keamanan kami.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">7. Respons Insiden</h2>
            <p className="mt-2">
              Kami memiliki protokol respons insiden yang jelas. Jika terjadi pelanggaran keamanan data
              yang memengaruhi data Anda, kami akan: (a) segera menindaklanjuti untuk mengendalikan insiden;
              (b) menilai dampak terhadap data pengguna; (c) memberitahu Anda dalam waktu 72 jam sejak
              insiden diketahui; (d) melaporkan ke otoritas terkait jika diwajibkan oleh hukum.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">8. Audit & Penilaian</h2>
            <p className="mt-2">
              Kami melakukan audit keamanan internal secara berkala dan menggunakan layanan pemindaian
              kerentanan otomatis untuk mendeteksi potensi celah keamanan. Hasil audit dan tindak lanjut
              remediasi didokumentasikan secara internal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">9. Tanggung Jawab Pengguna</h2>
            <p className="mt-2">
              Keamanan data juga bergantung pada praktik Anda. Kami sangat menyarankan: menggunakan
              password yang kuat dan unik, tidak membagikan kredensial login, mengaktifkan logout setelah
              selesai menggunakan perangkat bersama, serta segera melaporkan aktivitas mencurigakan pada akun Anda.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">10. Kontak Keamanan</h2>
            <p className="mt-2">
              Jika Anda menemukan potensi kerentanan keamanan atau aktivitas mencurigakan, silakan
              segera hubungi tim keamanan kami di <strong>security@laundryku.id</strong>. Kami menghargai
              laporan yang bertanggung jawab dan akan menindaklanjuti setiap laporan dengan serius.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
