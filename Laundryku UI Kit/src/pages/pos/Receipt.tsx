import { useParams } from "react-router-dom";
import { orderByNumber, organizations, customerById, branches } from "@/lib/mock-data";
import { formatIDR, formatDateID, formatTimeID, paymentStatusLabel } from "@/lib/status-labels";
import { QRCodePlaceholder } from "@/components/shared/QRCodePlaceholder";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Link } from "react-router-dom";

export default function Receipt() {
  const { slug, orderNumber } = useParams();
  const order = orderByNumber(orderNumber!) ?? {
    orderNumber: orderNumber!, orderCode: "TRK1010",
    items: [{ name: "Cuci Setrika", qty: 4, unit: "kg", price: 10000, subtotal: 40000 }],
    total: 40000, paid: 40000, remaining: 0, paymentStatus: "PAID" as const,
    customerId: "c_4", createdAt: new Date().toISOString(),
  };
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const branch = branches[0];
  const c = customerById((order as any).customerId);

  return (
    <div className="min-h-screen bg-muted/40 py-4 print:bg-white print:py-0">
      <div className="mx-auto max-w-xs">
        <div className="receipt-paper mx-auto w-[80mm] rounded-md border border-border p-4 text-[12px] leading-snug print:border-0">
          <div className="text-center">
            <p className="text-base font-bold">{org.name}</p>
            <p>{branch.name}</p>
            <p>{branch.address}</p>
            <p>{branch.phone}</p>
          </div>
          <hr className="my-2 border-dashed border-black/40" />
          <div className="flex justify-between"><span>No.</span><span>{order.orderNumber}</span></div>
          <div className="flex justify-between"><span>Tgl.</span><span>{formatDateID(order.createdAt)} {formatTimeID(order.createdAt)}</span></div>
          <div className="flex justify-between"><span>Pelanggan</span><span>{c?.name ?? "Umum"}</span></div>
          <hr className="my-2 border-dashed border-black/40" />
          {order.items.map((i, idx) => (
            <div key={idx} className="mb-1">
              <div>{i.name}</div>
              <div className="flex justify-between"><span>{i.qty} {i.unit} x {formatIDR(i.price)}</span><span>{formatIDR(i.subtotal)}</span></div>
            </div>
          ))}
          <hr className="my-2 border-dashed border-black/40" />
          <div className="flex justify-between font-bold"><span>TOTAL</span><span>{formatIDR(order.total)}</span></div>
          <div className="flex justify-between"><span>Bayar</span><span>{formatIDR(order.paid)}</span></div>
          <div className="flex justify-between"><span>Sisa</span><span>{formatIDR(order.remaining)}</span></div>
          <div className="flex justify-between"><span>Status</span><span>{paymentStatusLabel[order.paymentStatus]}</span></div>
          <hr className="my-2 border-dashed border-black/40" />
          <div className="flex flex-col items-center">
            <QRCodePlaceholder size={90} label={`Lacak: ${order.orderCode}`} />
            <p className="mt-1 text-center">Terima kasih telah laundry di {org.name}!</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 px-2 print:hidden">
          <Button onClick={() => window.print()} className="flex-1 tap-target"><Printer className="mr-1 h-4 w-4" />Cetak</Button>
          <Button asChild variant="outline" className="flex-1 tap-target"><Link to={`/${slug}/pos`}>Order Baru</Link></Button>
        </div>
      </div>
    </div>
  );
}