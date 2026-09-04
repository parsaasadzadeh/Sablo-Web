"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useCurrency } from "@/context/currencyContext";

const TYPE_VARIANTS = [
  { key: "INCOME",      label: "درآمد" },
  { key: "EXPENSE",     label: "خرج"   },
  { key: "INSTALLMENT", label: "قسط"   },
  { key: "LOAN",        label: "وام"   },
];

const formatAmount = (value) => {
  if (value === null || value === undefined) return "";
  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("en-US");
};

const unformatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

export default function TransactionModal({
  isOpen,
  onClose,
  onRefreshData,
  editingTransaction,
  categories = [],
  // تابع ساخت دسته‌بندی جدید — اختیاری
  // امضا: (label, icon) => Promise<{ success, category?, message? }>
  onCreateCategory,
  categoryFormLoading = false,
}) {
  const isEditMode = Boolean(editingTransaction);
  const { currency } = useCurrency();
  const unitLabel = currency === "IRT" ? "تومان" : "ریال";

  const [type,            setType]            = useState("EXPENSE");
  const [amount,          setAmount]          = useState("");
  const [title,           setTitle]           = useState("");
  const [description,     setDescription]     = useState("");
  const [dueDate,         setDueDate]         = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [category,        setCategory]        = useState(null);
  const [formLoading,     setFormLoading]     = useState(false);

  // فرم داخلی دسته‌بندی جدید
  const [showNewCat,  setShowNewCat]  = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon,  setNewCatIcon]  = useState("");
  const [newCatError, setNewCatError] = useState(null);

  const openNewCat = () => {
    setNewCatLabel(""); setNewCatIcon(""); setNewCatError(null);
    setShowNewCat(true);
  };
  const closeNewCat = () => { setShowNewCat(false); setNewCatError(null); };

  const submitNewCat = async () => {
    if (!onCreateCategory) return;
    const label = newCatLabel.trim();
    if (!label) { setNewCatError("نام دسته‌بندی را وارد کنید"); return; }
    setNewCatError(null);
    const result = await onCreateCategory(label, newCatIcon.trim() || "📦");
    if (result.success) {
      setCategory(result.category.id);
      closeNewCat();
    } else {
      setNewCatError(result.message);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      const displayAmount = currency === "IRT"
        ? Math.round(editingTransaction.amount / 10)
        : editingTransaction.amount;
      setAmount(formatAmount(displayAmount));
      setTitle(editingTransaction.title ?? "");
      setDescription(editingTransaction.description ?? "");
      setDueDate(editingTransaction.dueDate ? new Date(editingTransaction.dueDate) : "");
      setTransactionDate("");
      setCategory(editingTransaction.categoryId ?? null);
    } else {
      setType("EXPENSE"); setAmount(""); setTitle("");
      setDescription(""); setDueDate(""); setTransactionDate(""); setCategory(null);
    }
    setShowNewCat(false);
  }, [isOpen, editingTransaction]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => setAmount(formatAmount(e.target.value));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = unformatAmount(amount);
    if (!numericAmount || !title.trim()) {
      alert("لطفاً عنوان و مبلغ را وارد کنید");
      return;
    }
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;
    setFormLoading(true);
    try {
      const formattedDueDate         = dueDate         ? new Date(dueDate).toISOString()         : undefined;
      const formattedTransactionDate = transactionDate ? new Date(transactionDate).toISOString() : undefined;

      if (isEditMode) {
        await api.put(`/finance/update/${editingTransaction._id}`, {
          amount: amountInRial, title, description,
          categoryId: type === "EXPENSE" ? category : undefined,
          dueDate: (type === "LOAN" || type === "INSTALLMENT") ? formattedDueDate : undefined,
        });
      } else {
        await api.post("/finance/add", {
          type, amount: amountInRial, title, description,
          categoryId: type === "EXPENSE" ? category : undefined,
          dueDate: (type === "LOAN" || type === "INSTALLMENT") ? formattedDueDate : undefined,
          ...(formattedTransactionDate && { date: formattedTransactionDate }),
        });
      }
      onClose();
      onRefreshData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(error.response?.data?.message || "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  const showCategorySection = type === "EXPENSE" && (categories.length > 0 || onCreateCategory);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: #FCFBF8 !important; border-color: #E5E1D6 !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: #0F6F5C !important; }
      `}</style>

      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[#EDE8DC] shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#EDE8DC] rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-base font-bold text-[#26241F] mb-4 text-right">
          {isEditMode ? "ویرایش تراکنش" : "ثبت تراکنش هوشمند"}
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">

          {/* نوع تراکنش */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">نوع تراکنش</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_VARIANTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={isEditMode}
                  onClick={() => { setType(item.key); setCategory(null); setShowNewCat(false); }}
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
              <p className="text-[10px] text-[#8A8273] mt-1.5 text-right">
                نوع تراکنش پس از ثبت قابل تغییر نیست.
              </p>
            )}
          </div>

          {/* عنوان */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">عنوان</label>
            <input
              type="text"
              placeholder="مثال: حقوق، خرید، وام مسکن"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] text-right"
            />
          </div>

          {/* مبلغ */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">
              مبلغ ({unitLabel})
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`مبلغ را به ${unitLabel} وارد کنید`}
              value={amount}
              onChange={handleAmountChange}
              dir="ltr"
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] tracking-wider text-left"
            />
            <p className="text-[10px] text-[#8A8273] mt-1 text-right">
              {currency === "IRT" ? "مبلغ را به تومان وارد کنید" : "مبلغ را به ریال وارد کنید"}
            </p>
          </div>

          {/* تاریخ تراکنش */}
          {!isEditMode && (
            <div>
              <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">
                تاریخ تراکنش
              </label>
              <div className="flex flex-row-reverse gap-2 items-start">
                <button
                  type="button"
                  onClick={() => setTransactionDate("")}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                    !transactionDate
                      ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
                      : "bg-[#FCFBF8] border-[#E5E1D6] text-[#8A8273] hover:bg-[#EDE8DC]"
                  }`}
                >
                  امروز
                </button>
                <div className="flex-1">
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={transactionDate}
                    onChange={(d) => setTransactionDate(d?.isValid ? d.toDate() : "")}
                    calendarPosition="bottom-right"
                    placeholder="یا یک تاریخ دیگر انتخاب کن"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#8A8273] mt-1 text-right">
                برای تراکنش‌های قدیمی می‌تونی تاریخ واقعی‌شون رو انتخاب کنی
              </p>
            </div>
          )}

          {/* دسته‌بندی */}
          {showCategorySection && (
            <div>
              <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">
                دسته‌بندی (اختیاری)
              </label>

              {/* چیپ‌ها */}
              <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {/* دکمه دسته‌بندی جدید */}
                {onCreateCategory && (
                  <button
                    type="button"
                    onClick={() => (showNewCat ? closeNewCat() : openNewCat())}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border-2 border-dashed transition-colors ${
                      showNewCat
                        ? "border-[#0F6F5C] bg-[#0F6F5C]/10 text-[#0F6F5C]"
                        : "border-[#0F6F5C] text-[#0F6F5C] hover:bg-[#0F6F5C]/5"
                    }`}
                  >
                    <span>➕</span>
                    <span>دسته‌بندی جدید</span>
                  </button>
                )}

                {/* بدون دسته */}
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-semibold transition-colors ${
                    category === null
                      ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
                      : "bg-[#FCFBF8] border-[#E5E1D6] text-[#8A8273] hover:bg-[#EDE8DC]"
                  }`}
                >
                  <span>🚫</span>
                  <span>بدون دسته</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-semibold transition-colors ${
                      category === cat.id
                        ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
                        : "bg-[#FCFBF8] border-[#E5E1D6] text-[#8A8273] hover:bg-[#EDE8DC]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* فرم دسته‌بندی جدید — زیر چیپ‌ها باز میشه */}
              {showNewCat && (
                <div className="mt-3 bg-[#FCFBF8] border border-[#E5E1D6] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-row-reverse gap-2 items-center">
                    {/* آیکون — اختیاری */}
                    <input
                      type="text"
                      placeholder="📦"
                      maxLength={4}
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-14 text-center text-lg bg-white border border-[#E5E1D6] rounded-xl py-2 outline-none focus:border-[#0F6F5C]"
                    />
                    {/* نام دسته */}
                    <input
                      type="text"
                      placeholder="مثال: گازوئیل"
                      maxLength={30}
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitNewCat())}
                      className="flex-1 text-sm text-right bg-white border border-[#E5E1D6] rounded-xl px-3 py-2.5 outline-none focus:border-[#0F6F5C]"
                    />
                  </div>

                  {newCatError && (
                    <p className="text-[11px] text-red-500 text-right">{newCatError}</p>
                  )}

                  <div className="flex flex-row-reverse gap-2">
                    <button
                      type="button"
                      onClick={submitNewCat}
                      disabled={categoryFormLoading}
                      className="flex-1 bg-[#0F6F5C] disabled:opacity-70 text-white text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                    >
                      {categoryFormLoading
                        ? <Loader2 size={13} className="animate-spin" />
                        : "افزودن"}
                    </button>
                    <button
                      type="button"
                      onClick={closeNewCat}
                      className="bg-white border border-[#E5E1D6] text-[#8A8273] text-xs font-semibold rounded-xl px-4 py-2.5"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تاریخ سررسید */}
          {(type === "LOAN" || type === "INSTALLMENT") && (
            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5 text-right">
                تاریخ سررسید (شمسی)
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={dueDate}
                onChange={(d) => setDueDate(d?.isValid ? d.toDate() : "")}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ سررسید"
              />
            </div>
          )}

          {/* توضیحات */}
          <div>
            <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">
              توضیحات (اختیاری)
            </label>
            <textarea
              rows={2}
              placeholder="توضیحات تکمیلی..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] text-right resize-none"
            />
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-2.5 pt-1">
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
              className="bg-[#F3F4F6] text-[#26241F] font-semibold rounded-xl px-4 py-2.5 text-xs"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
