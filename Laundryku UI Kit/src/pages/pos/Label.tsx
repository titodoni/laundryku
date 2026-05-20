import { useParams, Link } from "react-router-dom";
import { orderByNumber, customerById } from "@/lib/mock-data";
import { formatDateID } from "@/lib/status-labels";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function Label() {
  const { slug, orderNumber } = useParams();
  const order = orderByNumber(orderNumber!);
  const c = order ? customerById(order.customerId) : null;

  return (
    <div className="min-h-screen bg-muted/40 py-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-xs">
        <div className="receipt-paper mx-auto w-[60mm] rounded-md border-2 border-dashed border-black p-3 text-[12px] print:border-0">
          <p className="text-center text-base font-bold">{orderNumber}</p>
          <hr className="my-2 border-dashed border-black" />
          <p><b>Nama:</b> {c?.name ?? "Pelanggan Umum"}</p>
          <p><b>Layanan:</b> {order?.items.map(i => `${i.name} ${i.qty}${i.unit}`).join(", ") ?? "—"}</p>
          <p><b>Tgl:</b> {order ? formatDateID(order.createdAt) : "—"}</p>
          <p><b>Selesai:</b> {order ? formatDateID(order.estimatedReadyAt) : "—"}</p>
          <div className="mt-2 flex justify-center">
            <div className="h-10 w-32 bg-[repeating-linear-gradient(90deg,#000_0_2px,transparent_2px_4px)]" />
          </div>
        </div>
        <div className="mt-4 flex gap-2 px-2 print:hidden">
          <Button onClick={() => window.print()} className="flex-1 tap-target"><Printer className="mr-1 h-4 w-4" />Cetak Label</Button>
          <Button asChild variant="outline" className="flex-1 tap-target"><Link to={`/${slug}/pos`}>Selesai</Link></Button>
        </div>
      </div>
    </div>
  );
}