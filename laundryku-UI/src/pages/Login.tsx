import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const Login = () => {
  const [role, setRole] = useState<"owner" | "staff">("owner");
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="container py-4">
        <Link to="/melati-clean" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold shadow-glow">M</div>
            <h1 className="mt-4 text-2xl font-bold font-display">Masuk ke Melati Clean</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pilih peran Anda untuk melanjutkan.</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => setRole("owner")}
              className={cn("rounded-xl border-2 p-3 text-left transition",
                role === "owner" ? "border-primary bg-primary-soft" : "border-border")}>
              <Crown className={cn("h-5 w-5", role === "owner" ? "text-primary" : "text-muted-foreground")} />
              <p className="font-semibold text-sm mt-1.5">Owner</p>
              <p className="text-xs text-muted-foreground">Akses penuh dashboard</p>
            </button>
            <button onClick={() => setRole("staff")}
              className={cn("rounded-xl border-2 p-3 text-left transition",
                role === "staff" ? "border-primary bg-primary-soft" : "border-border")}>
              <ShoppingCart className={cn("h-5 w-5", role === "staff" ? "text-primary" : "text-muted-foreground")} />
              <p className="font-semibold text-sm mt-1.5">Staff / Kasir</p>
              <p className="text-xs text-muted-foreground">Buat pesanan & cetak struk</p>
            </button>
          </div>

          <form className="mt-5 space-y-3" onSubmit={(e) => {
            e.preventDefault();
            nav(role === "owner" ? "/melati-clean/dashboard" : "/melati-clean/pos");
          }}>
            <div>
              <Label>{role === "owner" ? "Email atau Nomor HP" : "Nomor HP Staff"}</Label>
              <Input className="h-11 mt-1.5" defaultValue={role === "owner" ? "budi@melaticlean.id" : "0812-1111-3333"} />
            </div>
            <div>
              <Label>{role === "owner" ? "Kata Sandi" : "PIN"}</Label>
              <Input type="password" className="h-11 mt-1.5" defaultValue={role === "owner" ? "••••••••" : "1234"} />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-primary shadow-glow font-semibold">
              Masuk sebagai {role === "owner" ? "Owner" : "Staff"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-center text-muted-foreground">
            Belum punya akun? <Link to="/register" className="font-semibold text-primary">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
