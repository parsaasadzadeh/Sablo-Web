"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const TYPE_VARIANTS = [
  { key: "INCOME", label: "درآمد" },
  { key: "EXPENSE", label: "خرج" },
  { key: "INSTALLMENT", label: "قسط" },
  { key: "LOAN", label: "وام" }
];

// editingTransaction: null => حالت افزودن تراکنش جدید
// editingTransaction: {..} => حالت ویرایش یک تراکنش موجود
export default function TransactionModal({ isOpen, onClose, onRefreshData, editingTransaction }) {
  const isEditMode = Boolean(editingTransaction);

  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // هر بار مودال باز می‌شه یا تراکنش در حال ویرایش عوض می‌شه، فرم رو پر یا خالی می‌کنیم
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount ?? ""));
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !title) return alert("لطفاً عنوان و مبلغ را وارد کنید");

    setFormLoading(true);
    try {
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

      if (isEditMode) {
        // ویرایش: نوع تراکنش قابل تغییر نیست، فقط بقیه فیلدها آپدیت می‌شن
        await api.put(`/finance/update/${editingTransaction._id}`, {
          amount: Number(amount),
          title,
          description,
          dueDate: (type === 'LOAN' || type === 'INSTALLMENT') ? formattedDueDate : undefined
        });
      } else {
        await api.post("/finance/add", {
          type,
          amount: Number(amount),
          title,
          description,
          dueDate: (type === 'LOAN' || type === 'INSTALLMENT') ? formattedDueDate : undefined
        });
      }

      setTitle(""); setAmount(""); setDescription(""); setDueDate("");
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: rgb(255 251 235 / 0.5) !important; border-color: rgb(253 230 138) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: #0F6F5C !important; }
      `}</style>

      <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#EDE8DC] shadow-xl">
        <h3 className="text-lg font-bold text-[#26241F] mb-4">
          {isEditMode ? "ویرایش تراکنش" : "ثبت تراکنش هوشمند"}
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">نوع تراکنش</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_VARIANTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={isEditMode}
                  onClick={() => setType(item.key)}
                  className={`py-2 text-[11px] font-semibold rounded-xl border transition-all ${
                    type === item.key ? "bg-[#0F6F5C] text-white border-[#0F6F5C]" : "bg-[#FCFBF8] border-[#E5E1D6] text-[#3A372F]"
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

          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">عنوان</label>
            <input type="text" placeholder="مثال: حقوق، خرید، وام مسکن" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C]" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">مبلغ (ریال)</label>
            <input type="number" placeholder="مثال: 5000000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] tracking-wider" />
          </div>

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

          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5">توضیحات (اختیاری)</label>
            <textarea rows={2} placeholder="توضیحات تکمیلی..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C]" />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button type="submit" disabled={formLoading} className="flex-1 bg-[#0F6F5C] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5">
              {formLoading && <Loader2 size={14} className="animate-spin" />} {isEditMode ? "بروزرسانی تراکنش" : "ذخیره تراکنش"}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 font-semibold rounded-xl px-4 py-2.5 text-xs">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  );
}
