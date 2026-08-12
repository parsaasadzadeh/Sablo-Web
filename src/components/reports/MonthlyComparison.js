"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import api from "@/lib/axios";

const ROWS = [
  { key: "income",      label: "درآمد",      positiveIsGood: true  },
  { key: "expense",     label: "مخارج",      positiveIsGood: false },
  { key: "cashBalance", label: "موجودی خالص", positiveIsGood: true  },
];

function ChangeIndicator({ percent, positiveIsGood }) {
  if (percent === 0) {
    return (
      <div className="flex items-center justify-center gap-1">
        <Minus size={12} className="text-[#8A8273]" />
        <span className="text-xs text-[#8A8273]">بدون تغییر</span>
      </div>
    );
  }

  const isUp = percent > 0;
  const isGood = positiveIsGood ? isUp : !isUp;
  const color = isGood ? "text-emerald-600" : "text-rose-600";

  return (
    <div className={`flex items-center justify-center gap-1 ${color}`}>
      {isUp
        ? <TrendingUp size={12} />
        : <TrendingDown size={12} />
      }
      <span className="text-xs font-bold">
        {isUp ? "+" : ""}{percent}٪
      </span>
    </div>
  );
}

export default function MonthlyComparison({ display, unit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/finance/monthly-comparison");
        setData(res.data);
      } catch {
        setError("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 mb-6 flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-[#0F6F5C]" size={24} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 mb-6">
        <p className="text-sm text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 mb-6">
      <h3 className="text-base font-bold text-[#26241F] mb-6 text-right">مقایسه ماهانه</h3>

      {/* هدر ستون‌ها */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-2">
        <span className="text-xs font-bold text-[#8A8273] text-right">شاخص</span>
        <span className="text-xs font-bold text-[#8A8273] text-center">ماه قبل</span>
        <span className="text-xs font-bold text-[#8A8273] text-center">این ماه</span>
        <span className="text-xs font-bold text-[#8A8273] text-center">تغییر</span>
      </div>

      {/* ردیف‌ها */}
      <div className="space-y-2">
        {ROWS.map((row, i) => {
          const curr = data.current[row.key];
          const prev = data.previous[row.key];
          const change = data.changes[row.key];

          return (
            <div
              key={row.key}
              className={`grid grid-cols-4 gap-2 px-3 py-3 rounded-xl items-center ${
                i % 2 === 0 ? "bg-[#F7F4EE]" : "bg-white"
              }`}
            >
              <span className="text-sm font-semibold text-[#26241F] text-right">
                {row.label}
              </span>
              <span className="text-xs text-[#8A8273] text-center tabular">
                {display(prev)}
              </span>
              <span className="text-xs font-bold text-[#26241F] text-center tabular">
                {display(curr)}
              </span>
              <ChangeIndicator percent={change} positiveIsGood={row.positiveIsGood} />
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#8A8273] text-right mt-4">
        * مبالغ به {unit}
      </p>
    </div>
  );
}
