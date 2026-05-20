import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laundryku",
  description: "POS laundry kiloan berbasis web untuk bisnis laundry Indonesia."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
