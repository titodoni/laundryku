"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionTab = {
  href: string;
  label: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
};

export function SectionTabs({ tabs }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <div className="container flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
