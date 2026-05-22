import type { Prisma, ServiceCategory as PrismaServiceCategory } from "@prisma/client";

export type ServiceCategory = PrismaServiceCategory;

export type ServicePriceSummary = {
  id: string;
  price: number;
  priceMultiplier: number | null;
  isDefault: boolean;
};

export type ServiceSummary = {
  id: string;
  name: string;
  category: ServiceCategory;
  baseServiceId: string | null;
  baseServiceName: string | null;
  baseServicePrice: number | null;
  isActive: boolean;
  sortOrder: number;
  priceId: string | null;
  price: number;
  priceMultiplier: number | null;
};

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  KILOAN: "Kiloan",
  SATUAN: "Satuan",
  EXPRESS: "Express",
  ADDON: "Addon",
};

const servicePriceOrderBy: Prisma.ServicePriceOrderByWithRelationInput[] = [
  { isDefault: "desc" },
  { createdAt: "asc" },
];

export const serviceQueryInclude: Prisma.ServiceInclude = {
  prices: {
    orderBy: servicePriceOrderBy,
    take: 1,
    select: {
      id: true,
      price: true,
      priceMultiplier: true,
      isDefault: true,
    },
  },
  baseService: {
    select: {
      id: true,
      name: true,
      prices: {
        orderBy: servicePriceOrderBy,
        take: 1,
        select: {
          id: true,
          price: true,
          priceMultiplier: true,
          isDefault: true,
        },
      },
    },
  },
} as const;

export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getServiceDisplayPrice(service: ServiceSummary) {
  if (service.category === "EXPRESS" && service.baseServicePrice != null && service.priceMultiplier != null) {
    return Math.round(service.baseServicePrice * service.priceMultiplier);
  }

  return service.price;
}

export function serializeService(
  service: {
    id: string;
    name: string;
    category: ServiceCategory;
    baseServiceId: string | null;
    isActive: boolean;
    sortOrder: number;
    prices: ServicePriceSummary[];
    baseService: {
      id: string;
      name: string;
      prices: ServicePriceSummary[];
    } | null;
  },
): ServiceSummary {
  const defaultPrice = service.prices.find((price) => price.isDefault) ?? service.prices[0] ?? null;
  const baseDefaultPrice = service.baseService?.prices.find((price) => price.isDefault) ?? service.baseService?.prices[0] ?? null;

  return {
    id: service.id,
    name: service.name,
    category: service.category,
    baseServiceId: service.baseServiceId,
    baseServiceName: service.baseService?.name ?? null,
    baseServicePrice: baseDefaultPrice?.price ?? null,
    isActive: service.isActive,
    sortOrder: service.sortOrder,
    priceId: defaultPrice?.id ?? null,
    price: defaultPrice?.price ?? 0,
    priceMultiplier: defaultPrice?.priceMultiplier ?? null,
  };
}
