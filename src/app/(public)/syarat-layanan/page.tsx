import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Syarat & Layanan — LaundryKU",
  description: "Syarat dan ketentuan penggunaan platform LaundryKU.",
};

export default function SyaratLayananPage() {
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
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Syarat & Ketentuan Layanan</h1>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: 22 Mei 2026</p>
          </div>
        </div>

        <article className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">1. Definisi</h2>
            <p className="mt-2">
              <strong>"LaundryKU"</strong> adalah platform perangkat lunak berbasis web yang dikelola oleh entitas
              LaundryKU untuk membantu pengelolaan usaha laundry kiloan. <strong>"Pengguna"</strong> adalah individu
              atau badan usaha yang mendaftar dan menggunakan layanan LaundryKU. <strong>"Toko"</strong> adalah
              entitas bisnis laundry yang didaftarkan oleh Pengguna dalam platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">2. Penerimaan Syarat</h2>
            <p className="mt-2">
              Dengan mendaftar dan menggunakan LaundryKU, Anda menyetujui seluruh syarat dan ketentuan yang
              tercantum dalam dokumen ini. Jika Anda tidak menyetujui salah satu bagian dari syarat ini, Anda
              tidak diperkenankan menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">3. Kewajiban Pengguna</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Memberikan informasi yang akurat dan lengkap saat pendaftaran.</li>
              <li>Menjaga kerahasiaan kredensial akun dan tidak membagikannya kepada pihak ketiga.</li>
              <li>Memastikan seluruh data pelanggan yang dimasukkan telah mendapatkan persetujuan dari pelanggan.</li>
              <li>Tidak menggunakan platform untuk aktivitas ilegal, penipuan, atau tindakan yang merugikan pihak lain.</li>
              <li>Bertanggung jawab penuh atas semua aktivitas yang terjadi di bawah akun Anda.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">4. Batasan Penggunaan</h2>
            <p className="mt-2">
              Pengguna dilarang: (a) merekayasa balik, mendekompilasi, atau mencoba mendapatkan kode sumber platform;
              (b) menggunakan bot, scraper, atau metode otomatis lainnya untuk mengakses layanan;
              (c) menyebarkan malware, virus, atau kode berbahaya lainnya melalui platform;
              (d) membebani infrastruktur kami dengan traffic yang tidak wajar atau tujuan selain penggunaan normal UMKM laundry.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">5. Pembayaran & Berlangganan</h2>
            <p className="mt-2">
              Layanan LaundryKU tersedia dalam plan Free dan Pro. Plan Pro dikenakan biaya berlangganan bulanan
              sebesar Rp65.000 (enam puluh lima ribu Rupiah). Pembayaran dilakukan di muka untuk periode satu bulan.
              Kami berhak mengubah harga dengan pemberitahuan 14 hari kerja sebelumnya.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">6. Penghentian Layanan</h2>
            <p className="mt-2">
              LaundryKU berhak menangguhkan atau menghentikan akun Pengguna jika terbukti melanggar syarat ini,
              tanpa kewajiban memberikan pengembalian dana. Pengguna dapat menghentikan berlangganan Pro kapan saja;
              akses fitur Pro akan berakhir di akhir periode berlangganan yang telah dibayar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">7. Limitasi Tanggung Jawab</h2>
            <p className="mt-2">
              LaundryKU disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas kerugian tidak langsung,
              kehilangan data akibat kelalaian Pengguna, atau gangguan bisnis yang disebabkan oleh faktor di luar
              kendali kami (force majeure). Tanggung jawab maksimal kami terbatas pada jumlah berlangganan Pro
              yang telah dibayar Pengguna dalam 1 (satu) bulan terakhir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">8. Perubahan Ketentuan</h2>
            <p className="mt-2">
              Kami dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui
              dashboard Pengguna dan/atau email. Penggunaan berkelanjutan atas layanan setelah perubahan
              dianggap sebagai persetujuan atas syarat yang telah diperbarui.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">9. Hukum yang Berlaku</h2>
            <p className="mt-2">
              Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Segala sengketa akan diselesaikan
              secara musyawarah. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui pengadilan
              yang berwenang di wilayah hukum Republik Indonesia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">10. Kontak</h2>
            <p className="mt-2">
              Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami melalui
              email di <strong>support@laundryku.id</strong>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
