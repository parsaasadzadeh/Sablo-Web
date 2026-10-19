"use client";
import { useState } from "react";
import Link from "next/link";
import { BarChart2, Calculator, Target, ArrowLeftRight, Landmark, CreditCard, Settings, PiggyBank, BookOpen } from "lucide-react";
import TutorialModal from "@/components/tutorial/TutorialModal";

const ITEMS = [
  { label: "گزارش‌های مالی", icon: BarChart2, path: "/reports" },
  { label: "بودجه‌بندی", icon: PiggyBank, path: "/budgets" },
  { label: "اهداف مالی", icon: Target, path: "/goals" },
  { label: "تراکنش‌ها", icon: ArrowLeftRight, path: "/transactions" },
  { label: "وام‌ها", icon: Landmark, path: "/loans" },
  { label: "کارت‌ها", icon: CreditCard, path: "/cards" },
  { label: "تنظیمات", icon: Settings, path: "/settings" }, 
  { label: "دنگ", icon: Calculator, path: "/dong" },
];

export default function QuickNav() {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <>
    <nav
      aria-label="دسترسی سریع"
      className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] px-4 py-3 mb-4"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            prefetch
            className="flex items-center gap-1.5 bg-[var(--bg)] hover:bg-[var(--brand-light)] hover:text-[color:var(--brand)] text-[color:var(--ink)] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-[color:var(--border)] focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
          >
            <item.icon size={13} />
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setTutorialOpen(true)}
          className="flex items-center gap-1.5 bg-[var(--brand-light)] hover:opacity-80 text-[color:var(--brand)] text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity border border-[color:var(--brand)] focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
        >
          <BookOpen size={13} />
          آموزش
        </button>
      </div>
    </nav>

    <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  );
}
