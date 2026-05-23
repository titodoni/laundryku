import { StatCard } from "./StatCard";
import { TrendingUp, TrendingDown, Wallet, ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export function FinanceSummaryCards({ income, expense, orders }: { income: number; expense: number; orders: number }) {
  const profit = income - expense;
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Pemasukan" value={formatRupiah(income)} icon={TrendingUp} tone="success" />
      <StatCard label="Pengeluaran" value={formatRupiah(expense)} icon={TrendingDown} tone="destructive" />
      <StatCard label="Laba Bersih" value={formatRupiah(profit)} icon={Wallet} tone="primary" />
      <StatCard label="Jumlah Pesanan" value={orders} icon={ShoppingBag} tone="default" />
    </div>
  );
}
