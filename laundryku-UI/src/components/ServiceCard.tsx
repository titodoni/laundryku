import { cn } from "@/lib/utils";
import { serviceTypeLabel } from "@/lib/labels";
import { formatRupiah } from "@/lib/format";
import type { Service } from "@/mocks/types";

export function ServiceCard({ service, selected, onClick }: { service: Service; selected?: boolean; onClick?: () => void }) {
  const price = service.price.pricePerKg ?? service.price.pricePerItem ?? 0;
  const unit = service.price.pricePerKg ? "/kg" : "/pcs";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border-2 p-3 transition-all bg-card",
        selected ? "border-primary bg-primary-soft shadow-glow" : "border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-tight">{service.name}</p>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary-soft px-1.5 py-0.5 rounded">
          {serviceTypeLabel[service.type]}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{service.description}</p>
      <p className="mt-2 font-bold text-primary">{formatRupiah(price)}<span className="text-xs font-medium text-muted-foreground">{unit}</span></p>
    </button>
  );
}

export function ServiceGrid({ services, selectedId, onSelect }: { services: Service[]; selectedId?: string; onSelect: (s: Service) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {services.map(s => <ServiceCard key={s.id} service={s} selected={selectedId === s.id} onClick={() => onSelect(s)} />)}
    </div>
  );
}
