"use client";
import { useState } from "react";
import { Plus, CheckCircle, ChevronRight, ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";

const TAB_OPTIONS = [
  { key: "ALL", label: "همه" },
  { key: "INCOME", label: "درآمدها" },
  { key: "EXPENSE", label: "مخارج" },
  { key: "INSTALLMENT", label: "اقساط" },
  { key: "LOAN", label: "وام‌ها" }
];

export default function TransactionList({ 
  transactions, summary, currentPage, totalPages, onPageChange, onPayInstallment, onOpenModal,
  onEditTransaction, onDeleteTransaction
}) {
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredTransactions = transactions.filter(
    (tx) => activeTab === "ALL" || tx.type === activeTab
  );

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#26241F]">ریز تراکنش‌ها</h3>
          <p className="text-[11px] text-[#8A8273] mt-1">شما {summary.unpaidInstallmentsCount} قسط پرداخت نشده دارید.</p>
        </div>
        <button onClick={onOpenModal} className="flex items-center justify-center gap-1 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm shadow-[#0F6F5C]/20">
          <Plus size={16} /> ثبت تراکنش جدید
        </button>
      </div>

      {/* سیستم تب‌بندی ارگانیک */}
      <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-[#EDE8DC] tabular">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-xl transition-all ${
              activeTab === tab.key 
                ? "bg-[#0F6F5C]/10 text-[#0F6F5C] font-bold border border-[#0F6F5C]/20" 
                : "bg-transparent text-[#8A8273] hover:text-[#26241F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* استپ بدون تراکنش */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-[#8A8273]">تراکنشی در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#EDE8DC] max-h-[420px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => (
            <div key={tx._id} className="group flex items-center justify-between py-4 hover:bg-[#FCFBF8]/60 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 
                  tx.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700' : 
                  tx.type === 'INSTALLMENT' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {tx.type === 'INCOME' ? 'درآمد' : tx.type === 'EXPENSE' ? 'خرج' : tx.type === 'INSTALLMENT' ? 'قسط' : 'وام'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#26241F]">{tx.title}</h4>
                   
                  </div>
                  {tx.description && <p className="text-xs text-[#8A8273] mt-0.5">{tx.description}</p>}
                  {tx.dueDate && tx.type === 'INSTALLMENT' && !tx.isPaid && (
                    <span className="inline-block bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded mt-1">
                      سررسید: {formatJalaliDate(tx.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left shrink-0">
                {tx.type === 'INSTALLMENT' && !tx.isPaid && (
                  <button onClick={() => onPayInstallment(tx._id)} className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                    <CheckCircle size={12} /> پرداخت
                  </button>
                )}
                {tx.type === 'INSTALLMENT' && tx.isPaid && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> پرداخت شده</span>
                )}

                <div>
                  <span className={`text-sm font-bold tracking-wide tabular block ${tx.type === 'INCOME' || tx.type === 'LOAN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'INCOME' || tx.type === 'LOAN' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-xs font-normal">ریال</span>
                  </span>
                  <span className="block text-[10px] text-[#9A8F78] mt-1 tabular">{formatJalaliDate(tx.date)}</span>
                </div>

                {/* دکمه‌های ویرایش و حذف */}
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditTransaction(tx)}
                    title="ویرایش"
                    className="p-1.5 rounded-lg text-[#8A8273] hover:text-[#0F6F5C] hover:bg-[#0F6F5C]/10 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(tx)}
                    title="حذف"
                    className="p-1.5 rounded-lg text-[#8A8273] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* سیستم پیجینیشن */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#EDE8DC] pt-4 mt-2">
          <span className="text-[11px] text-[#8A8273]">صفحه {currentPage} از {totalPages}</span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-[#EDE8DC] text-[#26241F] disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-[#EDE8DC] text-[#26241F] disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
