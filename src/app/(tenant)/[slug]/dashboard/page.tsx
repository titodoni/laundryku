type DashboardPageProps = {
  params: {
    slug: string;
  };
};

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <main className="container py-10">
      <p className="text-sm font-semibold text-primary">Dashboard Owner</p>
      <h1 className="mt-2 text-3xl font-bold">{params.slug}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Dashboard shell placeholder. Phase 2 imports the dashboard layout and settings surfaces.
      </p>
    </main>
  );
}
