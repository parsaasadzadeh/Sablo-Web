"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCurrency } from "@/context/currencyContext";
import MonthSelector  from "@/components/reports/MonthSelector";
import ChartDonut     from "@/components/reports/ChartDonut";
import CategoryDonut  from "@/components/reports/CategoryDonut";
import MonthlyComparison from "@/components/reports/MonthlyComparison";

export default function ReportsContent() {
  const router          = useRouter();
  const { display, unit } = useCurrency();

  // بازه‌ی انتخاب‌شده توسط MonthSelector — به ChartDonut و CategoryDonut پاس می‌ره
  const [period, setPeriod] = useState({ isAll: true, label: "همه‌ی زمان‌ها" });

  const from = period.isAll ? undefined : period.from;
  const to   = period.isAll ? undefined : period.to;

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] p-4 sm:p-8 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Vazirmatn', sans-serif; }`}</style>

      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[#8A8273] hover:text-[#26241F]"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[#26241F]">گزارش‌های مالی</h1>
          <div />
        </div>

        {/* فیلتر ماه — state رو بالا می‌بره */}
        <MonthSelector
          display={display}
          unit={unit}
          onPeriodChange={setPeriod}
        />

        {/* نمودار توزیع مالی — از بازه انتخابی استفاده می‌کنه */}
        <ChartDonut display={display} unit={unit} from={from} to={to} />

        {/* نمودار دسته‌بندی — از بازه انتخابی استفاده می‌کنه */}
        <CategoryDonut display={display} unit={unit} from={from} to={to} />

        {/* مقایسه ماهانه — همیشه نمایش داده می‌شه */}
        <MonthlyComparison display={display} unit={unit} />
      </div>
    </div>
  );
}
