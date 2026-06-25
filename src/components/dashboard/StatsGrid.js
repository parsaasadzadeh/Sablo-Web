"use client";
import { TrendingUp, ArrowUpCircle, ArrowDownCircle, HelpCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function StatsGrid({ summary }) {
  const isNegative = summary.cashBalance < 0;

  return (
    <>
      {/* سیستم هوشمند هشدار تراز بودجه */}
      <div className={`mb-6 border rounded-2xl p-4 flex gap-3 items-start transition-all duration-300`}>
        {isNegative ? (
          <>
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-amber-900">تراز مالی منفی است!</h4>
              <p className="text-xs text-amber-700 mt-1 leading-5">شما {Math.abs(summary.cashBalance).toLocaleString()} ریال کسری بودجه دارید. مجموع مخارج شما از درآمدهایتان پیشی گرفته است.</p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">وضعیت مالی پایدار</h4>
              <p className="text-xs text-emerald-700 mt-1">تراز مالی مثبت است. شما در حال حاضر {summary.cashBalance.toLocaleString()} ریال نقدینگی دارید.</p>
            </div>
          </>
        )}
      </div>

      {/* شبکه کارت‌های شاخص‌های مالی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`text-white p-5 rounded-2xl shadow-sm transition-colors ${!isNegative ? 'bg-[#0F6F5C]' : 'bg-rose-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs opacity-90">موجودی خالص</span>
            <TrendingUp size={18} className="opacity-90" />
          </div>
          <h2 className="text-xl font-bold tracking-wide tabular">
            {summary.cashBalance.toLocaleString()} <span className="text-xs font-normal">ریال</span>
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DC] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[#8A8273] block">کل درآمدهای خالص</span>
            <span className="text-base font-bold text-[#26241F] tabular">
              {summary.totalIncome.toLocaleString()} <span className="text-[10px] font-normal">ریال</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DC] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[#8A8273] block">کل مخارج خالص</span>
            <span className="text-base font-bold text-[#26241F] tabular">
              {summary.totalExpense.toLocaleString()} <span className="text-[10px] font-normal">ریال</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DC] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HelpCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[#8A8273] block">بدهی باقی‌مانده (وام)</span>
            <span className="text-base font-bold text-amber-700 tabular">
              {summary.activeDebt.toLocaleString()} <span className="text-[10px] font-normal">ریال</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}