"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useCurrency } from "@/context/currencyContext";

const TYPE_VARIANTS = [
  { key: "INCOME", label: "درآمد" },
  { key: "EXPENSE", label: "خرج" },
  { key: "INSTALLMENT", label: "قسط" },
  { key: "LOAN", label: "وام" }
];

const formatAmount = (value) => {
  if (value === null || value === undefined) return "";
  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  const normalized = String(Number(digitsOnly));
  return Number(normalized).toLocaleString("en-US");
};

const unformatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

export default function TransactionModal({ isOpen, onClose, onRefreshData, editingTransaction }) {
  const isEditMode = Boolean(editingTransaction);
  const { currency } = useCurrency();
  const unitLabel = currency === "IRT" ? "تومان" : "ریال";

  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      // موقع ویرایش، مبلغ از دیتابیس ریاله — اگه تومانه تقسیم بر ۱۰ کن
      const displayAmount = currency === "IRT"
        ? Math.round(editingTransaction.amount / 10)
        : editingTransaction.amount;
      setAmount(formatAmount(displayAmount));
      setTitle(editingTransaction.title ?? "");
      setDescription(editingTransaction.description ?? "");
      setDueDate(editingTransaction.dueDate ? new Date(editingTransaction.dueDate) : "");
    } else {
      setType("EXPENSE");
      setAmount("");
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [isOpen, editingTransaction]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    setAmount(formatAmount(e.target.value));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = unformatAmount(amount);

    if (!numericAmount || !title.trim()) {
      alert("لطفاً عنوان و مبلغ را وارد کنید");
      return;
    }

    // اگه تومانه ضربدر ۱۰ میکنیم تا ریال بشه
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;

    setFormLoading(true);
    try {
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

      if (isEditMode) {
        await api.put(`/finance/update/${editingTransaction._id}`, {
          amount: amountInRial,
          title,
          description,
          dueDate: (type === "LOAN" || type === "INSTALLMENT") ? formattedDueDate : undefined
        });
      } else {
        await api.post("/finance/add", {
          type,
          amount: amountInRial,
          title,
          description,
          dueDate: (type === "LOAN" || type === "INSTALLMENT") ? formattedDueDate : undefined
        });
      }

      setTitle("");
      setAmount("");
      setDescription("");
      setDueDate("");
      onClose();
      onRefreshData();
    } catch (error) {
      console.error("Error saving transaction record:", error);
      alert(error.response?.data?.message || "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: rgb(255 251 235 / 0.5) !important; border-color: rgb(253 230 138) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: #0F6F5C !important; }
      `}</style>

      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[#EDE8DC] shadow-xl max-h-[92vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[#26241F] mb-4">
          {isEditMode ? "ویرایش تراکنش" : "ثبت تراکنش هوشمند"}
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* نوع تراکنش */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">نوع تراکنش</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_VARIANTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={isEditMode}
                  onClick={() => setType(item.key)}
                  className={`py-2 text-[11px] font-semibold rounded-xl border transition-all ${
                    type === item.key
                      ? "bg-[#0F6F5C] text-white border-[#0F6F5C]"
                      : "bg-[#FCFBF8] border-[#E5E1D6] text-[#3A372F]"
                  } ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {isEditMode && (
              <p className="text-[10px] text-[#8A8273] mt-1.5">نوع تراکنش پس از ثبت قابل تغییر نیست.</p>
            )}
          </div>

          {/* عنوان */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">عنوان</label>
            <input
              type="text"
              placeholder="مثال: حقوق، خرید، وام مسکن"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C]"
            />
          </div>

          {/* مبلغ — label و placeholder داینامیک */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">
              مبلغ ({unitLabel})
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`مبلغ را به ${unitLabel} وارد کنید`}
              value={amount}
              onChange={handleAmountChange}
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] tracking-wider"
            />
            <p className="text-[10px] text-[#8A8273] mt-1">
              {currency === "IRT"
                ? "مبلغ را به تومان وارد کنید"
                : "مبلغ را به ریال وارد کنید"}
            </p>
          </div>

          {/* تاریخ سررسید */}
          {(type === "LOAN" || type === "INSTALLMENT") && (
            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5">تاریخ سررسید (شمسی)</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={dueDate}
                onChange={(dateObject) => setDueDate(dateObject?.isValid ? dateObject.toDate() : "")}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ"
              />
            </div>
          )}

          {/* توضیحات */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">توضیحات (اختیاری)</label>
            <textarea
              rows={2}
              placeholder="توضیحات تکمیلی..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C]"
            />
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[#0F6F5C] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {isEditMode ? "بروزرسانی تراکنش" : "ذخیره تراکنش"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 font-semibold rounded-xl px-4 py-2.5 text-xs"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
