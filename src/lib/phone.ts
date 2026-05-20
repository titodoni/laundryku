export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function formatPhoneDisplay(phone: string) {
  const normalized = normalizePhone(phone);

  if (!normalized.startsWith("62")) {
    return phone;
  }

  return `0${normalized.slice(2)}`;
}
