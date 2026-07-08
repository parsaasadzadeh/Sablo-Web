"use client";
import { X, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";

const TYPE_LABELS = {
  INCOME: "درآمد",
  EXPENSE: "خرج",
  INSTALLMENT: "قسط",
  LOAN: "وام"
};

const TYPE_COLORS = {
  INCOME: "bg-emerald-50 text-emerald-700",
  EXPENSE: "bg-rose-50 text-rose-700",
  INSTALLMENT: "bg-orange-50 text-orange-700",
  LOAN: "bg-blue-50 text-blue-700"
};

export default function TransactionDetailModal({ transaction, onClose, onEdit, onDelete, onPayInstallment }) {
  if (!transaction) return null;
  const tx = transaction;
  const isPositive = tx.type === "INCOME" || tx.type === "LOAN";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[#EDE8DC] shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${TYPE_COLORS[tx.type]}`}>
              {TYPE_LABELS[tx.type]}
            </div>
            <h3 className="text-base font-bold text-[#26241F] break-words">{tx.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8A8273] hover:bg-gray-100 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* مبلغ */}
        <div className={`rounded-2xl p-4 mb-4 ${isPositive ? "bg-emerald-50" : "bg-rose-50"}`}>
          <span className="text-[11px] text-[#8A8273] block mb-1">مبلغ تراکنش</span>
          <span className={`text-xl font-bold tabular tracking-wide ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
            {isPositive ? "+" : "-"}{tx.amount.toLocaleString()} <span className="text-xs font-normal">ریال</span>
          </span>
        </div>

        {/* توضیحات کامل */}
        {tx.description && (
          <div className="mb-4">
            <span className="text-[11px] text-[#8A8273] block mb-1">توضیحات</span>
            <p className="text-sm text-[#3A372F] leading-6 break-words whitespace-pre-wrap">{tx.description}</p>
          </div>
        )}

        {/* اطلاعات تکمیلی */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-xs border-b border-[#EDE8DC] pb-2.5">
            <span className="text-[#8A8273]">دسته‌بندی</span>
            <span className="text-[#26241F] font-medium">{tx.category || "عمومی"}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-[#EDE8DC] pb-2.5">
            <span className="text-[#8A8273]">تاریخ ثبت</span>
            <span className="text-[#26241F] font-medium tabular">{formatJalaliDate(tx.date)}</span>
          </div>

          {tx.dueDate && (tx.type === "INSTALLMENT" || tx.type === "LOAN") && (
            <div className="flex items-center justify-between text-xs border-b border-[#EDE8DC] pb-2.5">
              <span className="text-[#8A8273]">تاریخ سررسید</span>
              <span className="text-[#26241F] font-medium tabular">{formatJalaliDate(tx.dueDate)}</span>
            </div>
          )}

          {tx.type === "INSTALLMENT" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8273]">وضعیت پرداخت</span>
              {tx.isPaid ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={13} /> پرداخت شده</span>
              ) : (
                <span className="text-amber-600 font-medium flex items-center gap-1"><Clock size={13} /> پرداخت نشده</span>
              )}
            </div>
          )}
        </div>

        {/* اکشن‌ها */}
        <div className="flex gap-2">
          {tx.type === "INSTALLMENT" && !tx.isPaid && (
            <button
              onClick={() => { onPayInstallment(tx._id); onClose(); }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} /> پرداخت قسط
            </button>
          )}
          <button
            onClick={() => { onEdit(tx); onClose(); }}
            className="flex-1 bg-[#0F6F5C]/10 hover:bg-[#0F6F5C]/20 text-[#0F6F5C] text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5"
          >
            <Pencil size={14} /> ویرایش
          </button>
          <button
            onClick={() => { onDelete(tx); onClose(); }}
            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} /> حذف
          </button>
        </div>
      </div>
    </div>
  );
}
