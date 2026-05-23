import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — LaundryKU",
  description: "Kebijakan privasi dan perlindungan data pengguna LaundryKU.",
};

export default function KebijakanPrivasiPage() {
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
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Kebijakan Privasi</h1>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: 22 Mei 2026</p>
          </div>
        </div>

        <article className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mt-2">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar dan menggunakan layanan,
              termasuk: nama, alamat email, nomor telepon, nama toko, data transaksi laundry, data pelanggan
              (nama, nomor HP, alamat), serta data keuangan usaha. Kami juga mengumpulkan data teknis seperti
              alamat IP, jenis perangkat, dan log aktivitas untuk keamanan sistem.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">2. Penggunaan Data</h2>
            <p className="mt-2">
              Data Anda digunakan untuk: (a) menyediakan dan mengelola layanan LaundryKU; (b) memproses
              pembayaran berlangganan; (c) mengirimkan notifikasi penting terkait akun dan layanan;
              (d) meningkatkan keamanan dan mencegah penipuan; (e) memberikan dukungan teknis.
              Kami <strong>tidak</strong> menjual data pribadi Anda kepada pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">3. Penyimpanan & Keamanan Data</h2>
            <p className="mt-2">
              Data Anda disimpan di server cloud yang dilengkapi enkripsi SSL/TLS dan enkripsi at-rest.
              Kami menerapkan protokol keamanan industri standar termasuk autentikasi dua faktor untuk
              akses internal, backup otomatis harian, dan monitoring insiden 24/7. Lihat halaman
              Keamanan Data untuk detail teknis lengkap.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">4. Pembagian Data dengan Pihak Ketiga</h2>
            <p className="mt-2">
              Kami hanya membagikan data dalam situasi terbatas: (a) dengan penyedia layanan infrastruktur
              (hosting, payment gateway) yang terikat perjanjian kerahasiaan; (b) jika diwajibkan oleh
              hukum atau perintah pengadilan; (c) untuk melindungi hak, properti, atau keselamatan
              LaundryKU, pengguna, atau publik.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">5. Hak Pengguna atas Data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Hak akses:</strong> Anda dapat melihat dan mengunduh data toko Anda kapan saja.</li>
              <li><strong>Hak koreksi:</strong> Anda dapat memperbarui informasi akun dan toko melalui pengaturan.</li>
              <li><strong>Hak penghapusan:</strong> Anda dapat meminta penghapusan akun dan data terkait dengan mengirimkan permohonan ke support@laundryku.id.</li>
              <li><strong>Hak pembatasan:</strong> Anda dapat meminta pembatasan penggunaan data tertentu dalam keadaan tertentu.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">6. Cookie & Teknologi Pelacakan</h2>
            <p className="mt-2">
              Kami menggunakan cookie esensial untuk menjaga sesi login dan keamanan akun. Kami juga
              menggunakan cookie analitik anonim untuk memahami bagaimana pengguna berinteraksi dengan
              platform guna meningkatkan pengalaman pengguna. Anda dapat mengatur preferensi cookie
              melalui pengaturan browser Anda.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">7. Retensi Data</h2>
            <p className="mt-2">
              Kami menyimpan data selama akun Anda aktif. Setelah akun dihapus, kami akan menghapus
              data pribadi Anda dalam waktu 30 hari, kecuali jika diwajibkan oleh hukum untuk menyimpannya
              lebih lama (misalnya untuk keperluan perpajakan atau hukum yang berlaku di Indonesia).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">8. Perubahan Kebijakan</h2>
            <p className="mt-2">
              Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan material akan
              diumumkan melalui email atau notifikasi dashboard. Penggunaan berkelanjutan atas layanan
              setelah perubahan dianggap sebagai persetujuan atas kebijakan yang telah diperbarui.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">9. Kontak</h2>
            <p className="mt-2">
              Untuk pertanyaan, permohonan akses data, atau penghapusan data, silakan hubungi kami di{" "}
              <strong>support@laundryku.id</strong>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
