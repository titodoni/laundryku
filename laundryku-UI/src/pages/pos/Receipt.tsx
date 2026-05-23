import { AppShell } from "@/components/AppShell";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { orders } from "@/mocks/data";
import { Link, useParams } from "react-router-dom";
import { Printer, Tag, MessageCircle, ArrowLeft } from "lucide-react";

const Receipt = () => {
  const { code } = useParams();
  const order = orders.find(o => o.code === code) ?? orders[0];

  return (
    <AppShell title="Struk Pesanan" subtitle={order.code} back="/melati-clean/pos/orders" showSidebar={false}>
      <div className="container py-4 space-y-3 max-w-md print:p-0 print:max-w-none">
        <ReceiptPreview order={order} />
        <div className="grid grid-cols-2 gap-2 print:hidden">
          <Button onClick={() => window.print()} className="h-11 bg-gradient-primary shadow-glow"><Printer className="h-4 w-4 mr-1" /> Cetak Struk</Button>
          <Button asChild variant="outline" className="h-11"><Link to={`/melati-clean/pos/receipt/${order.code}/label`}><Tag className="h-4 w-4 mr-1" /> Label</Link></Button>
        </div>
        <Button variant="outline" className="w-full h-11 print:hidden">
          <MessageCircle className="h-4 w-4 mr-1" /> Kirim ke WhatsApp
        </Button>
        <Button asChild variant="ghost" className="w-full print:hidden">
          <Link to="/melati-clean/pos/orders"><ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke daftar</Link>
        </Button>
      </div>
    </AppShell>
  );
};

export default Receipt;
