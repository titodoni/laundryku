import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { staffMembers, organizations } from "@/lib/mock-data";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { Plus, KeyRound, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Staff() {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const free = org.plan === "FREE";
  const limitReached = free && staffMembers.length >= 1;

  return (
    <DashboardLayout subtitle="Manajemen staf">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Staf</h2>
          {limitReached ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button disabled size="sm"><Lock className="mr-1 h-4 w-4" /> Tambah Staf</Button></span>
              </TooltipTrigger>
              <TooltipContent>Paket Free hanya mendukung 1 staff.</TooltipContent>
            </Tooltip>
          ) : (
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Tambah Staf</Button>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {staffMembers.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.phone}</p>
                </div>
                <RoleBadge role={s.role} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={s.active ? "text-success" : "text-muted-foreground"}>
                  {s.active ? "Aktif" : "Nonaktif"}
                </span>
                <span className="text-muted-foreground">Cabang Pusat</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1"><KeyRound className="mr-1 h-3.5 w-3.5" /> Reset PIN</Button>
                <Button size="sm" variant="ghost" className="flex-1">{s.active ? "Nonaktifkan" : "Aktifkan"}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}