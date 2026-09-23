"use client";
import { useState, useEffect } from "react";
import { Plus, CheckCircle, ChevronRight, ChevronLeft, Pencil, Trash2, Eye, Ban } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import TransactionDetailModal from "./TransactionDetailModal";
import { useCurrency } from "@/context/currencyContext";
import api from "@/lib/axios";

const TAB_OPTIONS = [
  { key: "ALL",         label: "همه"      },
  { key: "INCOME",      label: "درآمدها"  },
  { key: "EXPENSE",     label: "مخارج"    },
  { key: "INSTALLMENT", label: "اقساط"    },
  { key: "LOAN",        label: "وام‌ها"   },
];

// ── مودال انتخاب کارت هنگام پرداخت ─────────────────────────────────────────
function PayInstallmentModal({ visible, onClose, onConfirm, cards = [] }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 border border-[#EDE8DC] shadow-xl">
        <div className="w-10 h-1 bg-[#EDE8DC] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-1">
          <button onClick={onClose} className="text-[#8A8273] text-xs hover:text-[#26241F]">بستن</button>
          <h3 className="text-sm font-bold text-[#26241F]">پرداخت از کدام کارت؟</h3>
        </div>
        <p className="text-[11px] text-[#8A8273] text-right mb-4">
          یک کارت رو انتخاب کن، یا بدون ثبت کارت پرداخت رو تأیید کن
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {cards.map((card) => (
            <button
              key={card._id}
              onClick={() => onConfirm(card._id)}
              className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[#EDE8DC] hover:bg-[#F7F3EB] transition-colors text-right"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: card.color + "22" }}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#26241F]">{card.name}</p>
                {card.description && (
                  <p className="text-[11px] text-[#8A8273]">{card.description}</p>
                )}
              </div>
            </button>
          ))}

          {/* گزینه بدون کارت */}
          <button
            onClick={() => onConfirm(null)}
            className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[#EDE8DC] hover:bg-[#F7F3EB] transition-colors text-right"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F7F3EB] shrink-0">
              <Ban size={16} color="#8A8273" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#26241F]">بدون ثبت کارت</p>
              <p className="text-[11px] text-[#8A8273]">پرداخت بدون انتساب به کارت</p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-[#F3F4F6] text-[#26241F] font-semibold rounded-xl py-2.5 text-xs"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

// ── کامپوننت اصلی ────────────────────────────────────────────────────────────
export default function TransactionList({
  transactions, summary, currentPage, totalPages, onPageChange, onPayInstallment, onOpenModal,
  onEditTransaction, onDeleteTransaction,
}) {
  const [activeTab,            setActiveTab]            = useState("ALL");
  const [selectedTransaction,  setSelectedTransaction]  = useState(null);
  const [cards,                setCards]                = useState([]);
  const [payModal,             setPayModal]             = useState({ open: false, txId: null });
  const { display, unit } = useCurrency();

  // ── دریافت کارت‌ها یک‌بار ─────────────────────────────────────────────────
  useEffect(() => {
    api.get("/cards")
      .then((res) => setCards(res.data.cards ?? res.data ?? []))
      .catch(() => setCards([]));
  }, []);

  // ── کلیک دکمه پرداخت ─────────────────────────────────────────────────────
  const handlePayPress = (txId) => {
    if (cards.length === 0) {
      // کارتی نیست → مستقیم پرداخت
      onPayInstallment(txId, null);
    } else {
      // کارت هست → مودال انتخاب
      setPayModal({ open: true, txId });
    }
  };

  const handleConfirmPay = (cardId) => {
    setPayModal({ open: false, txId: null });
    onPayInstallment(payModal.txId, cardId);
  };

  const filteredTransactions = transactions.filter(
    (tx) => activeTab === "ALL" || tx.type === activeTab
  );

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#26241F]">ریز تراکنش‌ها</h3>
          <p className="text-[11px] text-[#8A8273] mt-1">
            شما {summary.unpaidInstallmentsCount} قسط پرداخت نشده دارید.
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="flex items-center justify-center gap-1 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm shadow-[#0F6F5C]/20"
        >
          <Plus size={16} /> ثبت تراکنش جدید
        </button>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 pb-4 mb-4 border-b border-[#EDE8DC] overflow-x-auto no-scrollbar -mx-1 px-1">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? "bg-[#0F6F5C]/10 text-[#0F6F5C] font-bold border border-[#0F6F5C]/20"
                : "bg-transparent text-[#8A8273] hover:text-[#26241F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-[#8A8273]">تراکنشی در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#EDE8DC] max-h-[480px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => (
            <div
              key={tx._id}
              className="group py-4 px-1 sm:px-2 rounded-xl hover:bg-[#FCFBF8]/60 transition-colors"
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className={`w-10 h-9 sm:w-12 sm:h-10 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                  tx.type === "INCOME"      ? "bg-emerald-50 text-emerald-700" :
                  tx.type === "EXPENSE"     ? "bg-rose-50 text-rose-700"      :
                  tx.type === "INSTALLMENT" ? "bg-orange-50 text-orange-700"  :
                  "bg-blue-50 text-blue-700"
                }`}>
                  {tx.type === "INCOME" ? "درآمد" : tx.type === "EXPENSE" ? "خرج" : tx.type === "INSTALLMENT" ? "قسط" : "وام"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#26241F] truncate">{tx.title}</h4>
                      {tx.description && (
                        <p className="text-xs text-[#8A8273] mt-0.5 break-words line-clamp-2">{tx.description}</p>
                      )}
                    </div>
                    <div className="text-left shrink-0">
                      <span className={`text-xs sm:text-sm font-bold tracking-wide tabular block whitespace-nowrap ${
                        tx.type === "INCOME" || tx.type === "LOAN" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {tx.type === "INCOME" || tx.type === "LOAN" ? "+" : "-"}
                        {display(tx.amount)}
                        <span className="text-[10px] font-normal"> {unit}</span>
                      </span>
                      <span className="block text-[10px] text-[#9A8F78] mt-1 tabular whitespace-nowrap">
                        {formatJalaliDate(tx.date)}
                      </span>
                    </div>
                  </div>

                  {tx.dueDate && tx.type === "INSTALLMENT" && !tx.isPaid && (
                    <span className="inline-block bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded mt-2">
                      سررسید: {formatJalaliDate(tx.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-2.5 pr-0 sm:pr-[3.5rem]">
                {tx.type === "INSTALLMENT" && !tx.isPaid && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePayPress(tx._id); }}
                    className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors ml-auto"
                  >
                    <CheckCircle size={12} /> پرداخت
                  </button>
                )}
                {tx.type === "INSTALLMENT" && tx.isPaid && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 ml-auto">
                    <CheckCircle size={12} /> پرداخت شده
                  </span>
                )}

                <button onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); }}
                  className="p-2 sm:p-1.5 rounded-lg text-[#8A8273] hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Eye size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEditTransaction(tx); }}
                  className="p-2 sm:p-1.5 rounded-lg text-[#8A8273] hover:text-[#0F6F5C] hover:bg-[#0F6F5C]/10 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteTransaction(tx); }}
                  className="p-2 sm:p-1.5 rounded-lg text-[#8A8273] hover:text-rose-600 hover:bg-rose-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#EDE8DC] pt-4 mt-2">
          <span className="text-[11px] text-[#8A8273]">صفحه {currentPage} از {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-[#EDE8DC] text-[#26241F] disabled:opacity-30 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-[#EDE8DC] text-[#26241F] disabled:opacity-30 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
        onPayInstallment={onPayInstallment}
      />

      {/* ── مودال انتخاب کارت برای پرداخت ── */}
      <PayInstallmentModal
        visible={payModal.open}
        onClose={() => setPayModal({ open: false, txId: null })}
        onConfirm={handleConfirmPay}
        cards={cards}
      />
    </div>
  );
}
