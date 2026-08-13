"use client";
import { useRouter } from "next/navigation";
import { BarChart2, Target } from "lucide-react";

export default function QuickNav() {
  const router = useRouter();

  const items = [
    { label: "گزارش‌های مالی", icon: BarChart2, path: "/reports" },
    { label: "اهداف مالی", icon: Target, path: "/goals" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] px-4 py-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex items-center gap-1.5 bg-[#F7F4EE] hover:bg-[#0F6F5C]/10 hover:text-[#0F6F5C] text-[#26241F] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-[#EDE8DC]"
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
