import { useState } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { MockUploadBox } from "@/components/shared/MockUploadBox";
import { Link } from "react-router-dom";

const steps = ["Laundry","Cabang","Layanan","Pembayaran","Staf","Konfirmasi"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("Laundry Melati");
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g,"");

  if (done) {
    return (
      <PublicLayout>
        <div className="container flex min-h-[70vh] max-w-md flex-col items-center justify-center py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Laundry berhasil dibuat</h1>
          <p className="mt-2 text-muted-foreground">Selamat datang di Laundryku, {name}!</p>
          <Button asChild className="mt-6 tap-target"><Link to={`/${slug}/dashboard`}>Buka Dashboard</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-2xl py-8">
        {/* Stepper */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
              i === step ? "border-primary bg-primary-soft text-primary" :
              i < step ? "border-success bg-success-soft text-success" :
              "border-border bg-card text-muted-foreground"
            }`}>
              <span className="font-semibold">{i + 1}</span><span>{s}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Profil laundry</h2>
              <div className="grid gap-3">
                <Field label="Nama laundry"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
                <Field label="Slug URL"><Input value={slug} readOnly className="bg-muted" />
                  <p className="mt-1 text-xs text-muted-foreground">URL: laundryku.com/{slug}</p></Field>
                <Field label="Nomor WhatsApp"><Input defaultValue="0812-3456-7890" /></Field>
                <Field label="Alamat"><Input defaultValue="Jl. Melati No. 12, Malang" /></Field>
                <Field label="Logo"><MockUploadBox label="Upload logo" /></Field>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Cabang utama</h2>
              <Field label="Nama cabang"><Input defaultValue="Cabang Pusat" /></Field>
              <Field label="Kode cabang"><Input defaultValue="MLT" />
                <p className="mt-1 text-xs text-muted-foreground">Dipakai untuk nomor order, contoh: MLT-260520-001</p></Field>
              <Field label="Alamat"><Input defaultValue="Jl. Melati No. 12, Malang" /></Field>
              <Field label="Telepon"><Input defaultValue="0341-111222" /></Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Layanan & harga</h2>
              <p className="text-sm text-muted-foreground">Layanan default dipakai paling sering. Bisa diubah nanti.</p>
              {[
                { name: "Cuci Setrika", cat: "Kiloan", price: "Rp10.000/kg" },
                { name: "Cuci Kering Lipat", cat: "Kiloan", price: "Rp7.000/kg" },
                { name: "Bed Cover", cat: "Satuan", price: "Rp25.000/pcs" },
                { name: "Express 6 Jam", cat: "Express", price: "Rp15.000/kg" },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.cat}</p></div>
                  <span className="text-sm font-semibold">{s.price}</span>
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Metode pembayaran</h2>
              {["Tunai","Transfer Bank","QRIS"].map(m => (
                <label key={m} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{m}</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
                </label>
              ))}
              <Field label="Upload QRIS (opsional)"><MockUploadBox label="Upload gambar QRIS" /></Field>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Tambah staf pertama</h2>
              <p className="text-sm text-muted-foreground">Boleh dilewati. Bisa ditambahkan nanti.</p>
              <Field label="Nama"><Input placeholder="Siti Aminah" /></Field>
              <Field label="No. HP"><Input placeholder="0812-..." /></Field>
              <Field label="PIN (6 digit)"><Input placeholder="••••••" inputMode="numeric" maxLength={6} /></Field>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Konfirmasi</h2>
              <p className="text-sm text-muted-foreground">Periksa kembali sebelum membuat laundry Anda.</p>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <p><span className="text-muted-foreground">Nama:</span> {name}</p>
                <p><span className="text-muted-foreground">URL:</span> /{slug}</p>
                <p><span className="text-muted-foreground">Cabang:</span> Cabang Pusat (MLT)</p>
                <p><span className="text-muted-foreground">Layanan:</span> 4 layanan default</p>
                <p><span className="text-muted-foreground">Pembayaran:</span> Tunai, Transfer, QRIS</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="tap-target">
                Lanjut <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setDone(true)} className="tap-target">Buat Laundry Saya</Button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}