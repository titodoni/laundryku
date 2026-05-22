"use client";

import { useEffect } from "react";

type MarkLabelPrintedProps = {
  slug: string;
  orderId: string;
};

export function MarkLabelPrinted({ slug, orderId }: MarkLabelPrintedProps) {
  useEffect(() => {
    void fetch(`/api/stores/${slug}/orders/${orderId}/label-printed`, {
      method: "POST",
    });
  }, [orderId, slug]);

  return null;
}
