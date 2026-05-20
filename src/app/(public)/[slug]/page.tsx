type StoreHomePageProps = {
  params: {
    slug: string;
  };
};

export default function StoreHomePage({ params }: StoreHomePageProps) {
  return (
    <main className="container flex min-h-screen max-w-2xl flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Laundryku Store</p>
      <h1 className="mt-2 text-3xl font-bold">{params.slug}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Public tenant page placeholder. Phase 1 must replace this with real Store lookup and 404 for unknown slug.
      </p>
    </main>
  );
}
