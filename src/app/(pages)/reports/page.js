"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import ChartDonut from "@/components/reports/ChartDonut";
import MonthlyComparison from "@/components/reports/MonthlyComparison";

export default function ReportsPage() {
  const router = useRouter();
  const { display, unit } = useCurrency();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/finance/stats")
      .then((res) => setStats(res.data))
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0F6F5C] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] p-4 sm:p-8 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Vazirmatn', sans-serif; }`}</style>

      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[#8A8273] hover:text-[#26241F] transition-colors"
          >
            <ArrowRight size={16} />
            بازگشت
          </button>
          <h1 className="text-xl font-bold text-[#26241F]">گزارش‌های مالی</h1>
        </div>

        {stats && (
          <ChartDonut summary={stats.summary} display={display} unit={unit} />
        )}

        <MonthlyComparison display={display} unit={unit} />
      </div>
    </div>
  );
}
