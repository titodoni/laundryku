type PosPageProps = {
  params: {
    slug: string;
  };
};

export default function PosPage({ params }: PosPageProps) {
  return (
    <main className="container py-10">
      <p className="text-sm font-semibold text-primary">POS Staff</p>
      <h1 className="mt-2 text-3xl font-bold">{params.slug}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        POS shell placeholder. Phase 3 imports the cashier write path and connects it to order APIs.
      </p>
    </main>
  );
}
