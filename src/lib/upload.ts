const MANAGED_UPLOAD_HOST_PATTERNS = ["blob.vercel-storage.com"];

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
export const UPLOAD_PURPOSES = ["qris", "store-logo", "onboarding-logo", "onboarding-qris"] as const;

export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function isUploadPurpose(value: string): value is UploadPurpose {
  return (UPLOAD_PURPOSES as readonly string[]).includes(value);
}

export function buildStoreUploadPath(
  storeId: string,
  purpose: Extract<UploadPurpose, "qris" | "store-logo">,
  fileName: string,
) {
  const safeName = sanitizeFileName(fileName) || "file";
  const folder = purpose === "qris" ? "qris" : "logo";
  return `stores/${storeId}/${folder}/${crypto.randomUUID()}-${safeName}`;
}

export function buildOnboardingUploadPath(
  userId: string,
  purpose: Extract<UploadPurpose, "onboarding-logo" | "onboarding-qris">,
  fileName: string,
) {
  const safeName = sanitizeFileName(fileName) || "file";
  const folder = purpose === "onboarding-qris" ? "qris" : "logo";
  return `onboarding/${userId}/${folder}/${crypto.randomUUID()}-${safeName}`;
}

export function localizeUploadErrorMessage(error?: string | null) {
  const message = error?.trim();

  if (!message) {
    return "Upload gagal. Coba lagi.";
  }

  if (
    message === "Tidak ada file yang dikirim." ||
    message === "Hanya file gambar yang diperbolehkan." ||
    message === "Ukuran file terlalu besar." ||
    message === "Server upload belum dikonfigurasi." ||
    message === "Anda harus login terlebih dahulu." ||
    message === "Anda tidak memiliki akses untuk upload file." ||
    message === "Tujuan upload wajib diisi." ||
    message === "Tujuan upload tidak dikenal." ||
    message === "Slug toko wajib diisi." ||
    message === "Toko tidak ditemukan." ||
    message === "Akses toko ditolak." ||
    message === "Upload onboarding tidak tersedia untuk akun ini." ||
    message === "Upload gagal. Coba lagi." ||
    message === "Format gambar tidak didukung."
  ) {
    return message;
  }

  if (message === "No file provided") {
    return "Tidak ada file yang dikirim.";
  }

  if (message === "Only image files are allowed") {
    return "Hanya file gambar yang diperbolehkan.";
  }

  if (message === "File too large (max 2MB)") {
    return "Ukuran file terlalu besar.";
  }

  if (message === "Upload failed") {
    return "Upload gagal. Coba lagi.";
  }

  if (message.includes("not configured") || message.includes("BLOB_READ_WRITE_TOKEN")) {
    return "Server upload belum dikonfigurasi.";
  }

  return "Upload gagal. Coba lagi.";
}

export function parseManagedUploadUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const isManaged = MANAGED_UPLOAD_HOST_PATTERNS.some((pattern) => parsed.hostname.includes(pattern));
    if (!isManaged) {
      return null;
    }

    return {
      hostname: parsed.hostname,
      pathname: parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname,
      url: parsed.toString(),
    };
  } catch {
    return null;
  }
}

export function isOwnedStoreUploadUrl(
  url: string | null | undefined,
  storeId: string,
  purpose: Extract<UploadPurpose, "qris" | "store-logo">,
) {
  const parsed = parseManagedUploadUrl(url);
  if (!parsed) {
    return false;
  }

  const folder = purpose === "qris" ? "qris" : "logo";
  return parsed.pathname.startsWith(`stores/${storeId}/${folder}/`);
}
