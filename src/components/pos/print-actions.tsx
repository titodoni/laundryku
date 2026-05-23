"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReceiptActionsProps = {
  slug: string;
  orderCode: string;
};

export function ReceiptActions({ slug, orderCode }: ReceiptActionsProps) {
  return (
    <div className="no-print flex flex-col gap-2 sm:flex-row">
      <Button type="button" className="tap-target flex-1" onClick={() => window.print()}>
        Cetak Struk
      </Button>
      <Button asChild type="button" variant="outline" className="tap-target flex-1">
        <Link href={`/${slug}/orders/${orderCode}/label`}>Cetak Label</Link>
      </Button>
      <Button asChild type="button" variant="ghost" className="tap-target flex-1">
        <Link href={`/${slug}/pos`}>Buat Pesanan Baru</Link>
      </Button>
    </div>
  );
}

type LabelActionsProps = {
  slug: string;
  orderCode: string;
};

export function LabelActions({ slug, orderCode }: LabelActionsProps) {
  return (
    <div className="no-print space-y-2">
      <Button type="button" className="tap-target w-full" onClick={() => window.print()}>
        Cetak Label
      </Button>
      <Button asChild type="button" variant="outline" className="tap-target w-full">
        <Link href={`/${slug}/orders/${orderCode}/receipt`}>Lihat Struk</Link>
      </Button>
      <Button asChild type="button" variant="ghost" className="tap-target w-full">
        <Link href={`/${slug}/pos/orders`}>Lihat Progress Pesanan</Link>
      </Button>
    </div>
  );
}
