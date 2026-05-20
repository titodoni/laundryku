import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TenantPublicLayout } from "@/components/layouts/TenantPublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TenantLogin() {
  const { slug } = useParams();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= 3;
  const [error, setError] = useState<string | null>(null);

  const submitStaff = () => {
    if (locked) return;
    if (pin !== "123456") {
      setAttempts(a => a + 1);
      setError(attempts + 1 >= 3 ? "Terlalu banyak percobaan. Coba lagi dalam 15 menit." : "PIN salah. Coba lagi.");
    } else {
      window.location.href = `/${slug}/pos`;
    }
  };

  return (
    <TenantPublicLayout>
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih jenis akun Anda.</p>

          <Tabs defaultValue="staff" className="mt-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="owner">Owner/Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="staff" className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>No. HP</Label><Input placeholder="0812-..." inputMode="tel" />
              </div>
              <div className="space-y-1.5">
                <Label>PIN 6 digit</Label>
                <Input value={pin} onChange={e => setPin(e.target.value)} inputMode="numeric" maxLength={6} placeholder="••••••" />
              </div>
              <p className="text-xs text-muted-foreground">Kasir, operator, atau kurir.</p>
              {error && <p className="rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button className="w-full tap-target" onClick={submitStaff} disabled={locked}>Masuk</Button>
            </TabsContent>

            <TabsContent value="owner" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">Akun owner menggunakan Google.</p>
              <Button className="w-full tap-target" asChild>
                <Link to={`/${slug}/dashboard`}>Lanjut dengan Google</Link>
              </Button>
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Pelanggan? <Link to={`/${slug}`} className="text-primary hover:underline">Kembali ke halaman utama</Link>
        </p>
      </div>
    </TenantPublicLayout>
  );
}