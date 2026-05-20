export default function OnboardingPage() {
  return (
    <main className="container flex min-h-screen max-w-2xl flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Onboarding</p>
      <h1 className="mt-2 text-3xl font-bold">Setup laundry pertama</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Halaman ini disiapkan untuk wizard Store, Branch, layanan, pembayaran, staf, dan konfirmasi.
      </p>
      <div className="mt-6 rounded-2xl border bg-card p-6">
        <p className="text-sm font-medium">Stage UI Kit berikutnya akan mengimpor wizard dari template dan menghubungkannya ke `POST /api/stores`.</p>
      </div>
    </main>
  );
}
