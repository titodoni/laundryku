export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return "Rp0";
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp${Math.abs(Math.round(value)).toLocaleString("id-ID")}`;
}

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatTanggal(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatJam(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${String(date.getHours()).padStart(2, "0")}.${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatTanggalRelatif(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const now = new Date();
  const startOf = (input: Date) => new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
  const diffDays = Math.round((startOf(date) - startOf(now)) / 86400000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === -1) return "Kemarin";
  if (diffDays === 1) return "Besok";

  return formatTanggal(date);
}
