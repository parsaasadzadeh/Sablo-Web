"use client";
import { useRouter } from "next/navigation";
import { BarChart2, Target } from "lucide-react";

export default function QuickNav() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-5 mb-6">
      <h3 className="text-sm font-bold text-[#26241F] text-right mb-4">دسترسی سریع</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/reports")}
          className="flex flex-col items-center justify-center gap-2 bg-[#F7F4EE] hover:bg-[#EDE8DC] border border-[#EDE8DC] rounded-xl py-4 transition-colors"
        >
          <div className="w-10 h-10 bg-[#0F6F5C]/10 rounded-xl flex items-center justify-center">
            <BarChart2 size={20} className="text-[#0F6F5C]" />
          </div>
          <span className="text-xs font-semibold text-[#26241F]">گزارش‌های مالی</span>
        </button>

        <button
          onClick={() => router.push("/goals")}
          className="flex flex-col items-center justify-center gap-2 bg-[#F7F4EE] hover:bg-[#EDE8DC] border border-[#EDE8DC] rounded-xl py-4 transition-colors"
        >
          <div className="w-10 h-10 bg-[#0F6F5C]/10 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-[#0F6F5C]" />
          </div>
          <span className="text-xs font-semibold text-[#26241F]">اهداف مالی</span>
        </button>
      </div>
    </div>
  );
}
