import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="container flex min-h-screen max-w-md flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Daftar Owner</p>
      <h1 className="mt-2 text-3xl font-bold">Buat akun Laundryku</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Masuk dengan akun Google pemilik usaha. Setelah itu, lengkapi setup toko pertama.
      </p>
      <RegisterForm />
    </main>
  );
}
