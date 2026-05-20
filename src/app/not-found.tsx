import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Link yang dibuka tidak tersedia atau tenant belum dibuat.
        </p>
        <Link className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
