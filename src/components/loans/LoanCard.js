"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Clock, Trash2 } from "lucide-react";

function formatJalali(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fa-IR"); } catch { return ""; }
}

export default function LoanCard({ loan, display, unit, onPay, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const progressColor = loan.isFullyPaid
    ? "bg-emerald-500"
    : loan.progressPercent >= 75
    ? "bg-blue-500"
    : loan.progressPercent >= 40
    ? "bg-[#0F6F5C]"
    : "bg-amber-500";

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden mb-4">

      {/* هدر کارت */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* راست: عنوان + وضعیت */}
          <div className="text-right">
            <h3 className="text-sm font-bold text-[#26241F]">{loan.title}</h3>
            {loan.description && (
              <p className="text-xs text-[#8A8273] mt-0.5">{loan.description}</p>
            )}
            <p className="text-xs text-[#8A8273] mt-1">
              از {formatJalali(loan.date)}
            </p>
          </div>

          {/* چپ: دکمه حذف + وضعیت */}
          <div className="flex items-center gap-2">
            {loan.isFullyPaid && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle size={10} /> تسویه شده
              </span>
            )}
            <button
              onClick={() => onDelete(loan)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={14} className="text-rose-400" />
            </button>
          </div>
        </div>

        {/* progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-[#8A8273]">
              {loan.paidCount} از {loan.installmentCount} قسط پرداخت شده
            </span>
            <span className="text-[11px] font-bold text-[#26241F]">
              {loan.progressPercent}٪
            </span>
          </div>
          <div className="h-2 bg-[#F7F4EE] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${loan.progressPercent}%` }}
            />
          </div>
        </div>

        {/* خلاصه مالی */}
        <div className="flex flex-row-reverse gap-2 mb-3">
          <div className="flex-1 bg-[#F7F4EE] rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-[#8A8273] mb-0.5">پرداخت شده</p>
            <p className="text-xs font-bold text-emerald-600">
              {display(loan.paidAmount)} {unit}
            </p>
          </div>
          <div className="flex-1 bg-[#F7F4EE] rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-[#8A8273] mb-0.5">مانده</p>
            <p className="text-xs font-bold text-rose-500">
              {display(loan.remainingAmount)} {unit}
            </p>
          </div>
          <div className="flex-1 bg-[#F7F4EE] rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-[#8A8273] mb-0.5">هر قسط</p>
            <p className="text-xs font-bold text-[#26241F]">
              {display(loan.installments[0]?.amount ?? 0)} {unit}
            </p>
          </div>
        </div>

        {/* قسط بعدی */}
        {loan.nextInstallment && !loan.isFullyPaid && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <button
              onClick={() => onPay(loan.nextInstallment._id)}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle size={12} /> پرداخت قسط
            </button>
            <div className="text-right">
              <p className="text-xs font-bold text-amber-800">قسط بعدی</p>
              <p className="text-[11px] text-amber-700 flex items-center gap-1 justify-end">
                <Clock size={10} />
                {formatJalali(loan.nextInstallment.dueDate)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* دکمه نمایش همه اقساط */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-[#EDE8DC] text-xs font-semibold text-[#8A8273] hover:bg-[#F7F4EE] transition-colors"
      >
        {expanded ? (
          <><ChevronUp size={14} /> بستن اقساط</>
        ) : (
          <><ChevronDown size={14} /> نمایش همه اقساط ({loan.installmentCount})</>
        )}
      </button>

      {/* لیست همه اقساط */}
      {expanded && (
        <div className="border-t border-[#EDE8DC] divide-y divide-[#F7F4EE]">
          {loan.installments.map((inst, i) => (
            <div
              key={inst._id}
              className={`flex items-center justify-between px-4 py-3 ${
                inst.isPaid ? "opacity-50" : ""
              }`}
            >
              {/* راست: شماره + تاریخ */}
              <div className="text-right">
                <p className="text-xs font-semibold text-[#26241F]">
                  قسط {i + 1}
                </p>
                <p className="text-[10px] text-[#8A8273]">
                  سررسید: {formatJalali(inst.dueDate)}
                </p>
              </div>

              {/* چپ: مبلغ + وضعیت */}
              <div className="flex items-center gap-2">
                {inst.isPaid ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle size={11} /> پرداخت شده
                  </span>
                ) : (
                  <button
                    onClick={() => onPay(inst._id)}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    پرداخت
                  </button>
                )}
                <p className="text-xs font-bold text-[#26241F]">
                  {display(inst.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
