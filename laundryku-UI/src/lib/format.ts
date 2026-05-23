// Indonesian formatters
export const formatRupiah = (n: number): string => {
  if (n == null || isNaN(n)) return "Rp0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  return `${sign}Rp${abs.toLocaleString("id-ID")}`;
};

export const formatRupiahShort = (n: number): string => {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}rb`;
  return formatRupiah(n);
};

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export const formatTanggal = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTanggalRelatif = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86400000);
  if (diffDays === 0) return "Hari ini";
  if (diffDays === -1) return "Kemarin";
  if (diffDays === 1) return "Besok";
  return formatTanggal(d);
};

export const formatJam = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatTanggalJam = (iso: string | Date): string => {
  return `${formatTanggalRelatif(iso)} • ${formatJam(iso)}`;
};

export const formatKg = (kg: number) => `${kg.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`;
