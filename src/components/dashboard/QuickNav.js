"use client";
import Link from "next/link";
import { BarChart2, Target, ArrowLeftRight, Landmark, CreditCard, Settings } from "lucide-react";

const ITEMS = [
  { label: "گزارش‌های مالی", icon: BarChart2, path: "/reports" },
  { label: "اهداف مالی", icon: Target, path: "/goals" },
  { label: "تراکنش‌ها", icon: ArrowLeftRight, path: "/transactions" },
  { label: "وام‌ها", icon: Landmark, path: "/loans" },
  { label: "کارت‌ها", icon: CreditCard, path: "/cards" },
  { label: "تنظیمات", icon: Settings, path: "/settings" },
];

export default function QuickNav() {
  return (
    <nav
      aria-label="دسترسی سریع"
      className="bg-white dark:bg-[#1E1D1A] rounded-2xl border border-[#EDE8DC] dark:border-[#3A3832] px-4 py-3 mb-4"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            prefetch
            className="flex items-center gap-1.5 bg-[#F7F4EE] dark:bg-[#141311] hover:bg-[#0F6F5C]/10 hover:text-[#0F6F5C] text-[#26241F] dark:text-[#F3F0E8] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-[#EDE8DC] dark:border-[#3A3832] focus-visible:outline-2 focus-visible:outline-[#0F6F5C]"
          >
            <item.icon size={13} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
