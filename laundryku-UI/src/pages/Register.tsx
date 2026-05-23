import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="container py-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold shadow-glow">L</div>
            <h1 className="mt-4 text-2xl font-bold font-display">Daftar Akun Laundryku</h1>
            <p className="mt-1 text-sm text-muted-foreground">Coba gratis 7 hari, tanpa kartu kredit.</p>
          </div>
          <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); window.location.href = "/onboarding"; }}>
            <div>
              <Label htmlFor="biz">Nama Usaha</Label>
              <Input id="biz" placeholder="Melati Clean Laundry" required className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="Budi Santoso" required className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input id="phone" type="tel" placeholder="0812-3456-7890" required className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="kamu@email.com" required className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="pwd">Kata Sandi</Label>
              <Input id="pwd" type="password" placeholder="Minimal 8 karakter" required className="mt-1.5 h-11" />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-primary shadow-glow font-semibold">Buat Akun</Button>
            <p className="text-xs text-muted-foreground text-center pt-1">
              Dengan mendaftar, Anda menyetujui Syarat Layanan dan Kebijakan Privasi Laundryku.
            </p>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/melati-clean/login" className="font-semibold text-primary">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
