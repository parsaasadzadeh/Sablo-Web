"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useCurrency } from "@/context/currencyContext";
import { useTheme } from "@/context/themeContext";
import api from "@/lib/axios";

const formatAmount = (value) => {
  if (!value && value !== 0) return "";
  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("en-US");
};

const unformatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
const HINT = "text-[10px] text-[color:var(--muted)] text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";

export default function CreateLoanModal({ isOpen, onClose, onCreated }) {
  const { currency } = useCurrency();
  const { mode } = useTheme();
  const unitLabel = currency === "IRT" ? "تومان" : "ریال";

  const [title,             setTitle]             = useState("");
  const [totalAmount,       setTotalAmount]       = useState("");
  const [installmentCount,  setInstallmentCount]  = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [firstDueDate,      setFirstDueDate]      = useState(null);
  const [description,       setDescription]       = useState("");
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);

  // محاسبه خودکار مبلغ قسط
  const handleTotalOrCountChange = (newTotal, newCount) => {
    const t = unformatAmount(newTotal);
    const c = parseInt(newCount) || 0;
    if (t > 0 && c > 0) {
      setInstallmentAmount(formatAmount(Math.ceil(t / c)));
    }
  };

  const handleTotalChange = (e) => {
    const v = formatAmount(e.target.value);
    setTotalAmount(v);
    handleTotalOrCountChange(v, installmentCount);
  };

  const handleCountChange = (e) => {
    const v = e.target.value.replace(/[^\d]/g, "");
    setInstallmentCount(v);
    handleTotalOrCountChange(totalAmount, v);
  };

  const reset = () => {
    setTitle(""); setTotalAmount(""); setInstallmentCount("");
    setInstallmentAmount(""); setFirstDueDate(null);
    setDescription(""); setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const total   = unformatAmount(totalAmount);
    const count   = parseInt(installmentCount) || 0;
    const instAmt = unformatAmount(installmentAmount);

    if (!title.trim())  return setError("نام وام را وارد کنید");
    if (total <= 0)     return setError("مبلغ کل وام را وارد کنید");
    if (count < 1)      return setError("تعداد اقساط را وارد کنید");
    if (instAmt <= 0)   return setError("مبلغ هر قسط را وارد کنید");
    if (!firstDueDate)  return setError("تاریخ اولین قسط را انتخاب کنید");

    const totalInRial   = currency === "IRT" ? total   * 10 : total;
    const instAmtInRial = currency === "IRT" ? instAmt * 10 : instAmt;

    setLoading(true);
    try {
      await api.post("/finance/loans/create", {
        title:             title.trim(),
        totalAmount:       totalInRial,
        installmentCount:  count,
        installmentAmount: instAmtInRial,
        firstDueDate:      new Date(firstDueDate).toISOString(),
        description:       description.trim(),
      });
      reset();
      onClose();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: var(--input-bg) !important; color: var(--ink) !important; border: 1px solid var(--input-border) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>

      <div className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[color:var(--border)] shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-base font-bold text-[color:var(--ink)] mb-1 text-right">ثبت وام جدید</h3>
        <p className="text-xs text-[color:var(--muted)] text-right mb-4">
          اقساط به صورت خودکار ساخته می‌شوند
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* نام وام */}
          <div>
            <label className={LABEL}>نام وام</label>
            <input
              type="text"
              placeholder="مثال: وام بانک ملت، وام مسکن"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${INPUT} text-right`}
            />
          </div>

          {/* مبلغ کل */}
          <div>
            <label className={LABEL}>مبلغ کل وام ({unitLabel})</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="مثال: 500,000,000"
              value={totalAmount}
              onChange={handleTotalChange}
              dir="ltr"
              className={`${INPUT} tracking-wider text-left`}
            />
          </div>

          {/* تعداد اقساط و مبلغ هر قسط */}
          <div className="flex flex-row-reverse gap-3">
            <div className="flex-1">
              <label className={LABEL}>تعداد اقساط</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="مثال: 36"
                value={installmentCount}
                onChange={handleCountChange}
                dir="ltr"
                className={`${INPUT} text-left`}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL}>مبلغ هر قسط ({unitLabel})</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="خودکار محاسبه میشه"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(formatAmount(e.target.value))}
                dir="ltr"
                className={`${INPUT} text-left`}
              />
            </div>
          </div>

          <p className={`${HINT} -mt-2`}>
            مبلغ هر قسط با وارد کردن مبلغ کل و تعداد، خودکار محاسبه میشه — می‌تونی دستی هم تغییرش بدی
          </p>

          {/* تاریخ اولین قسط */}
          <div>
            <label className={LABEL}>تاریخ اولین قسط (شمسی)</label>
            <DatePicker
              className={mode === "dark" ? "bg-dark" : ""}
              calendar={persian}
              locale={persian_fa}
              value={firstDueDate}
              onChange={(d) => setFirstDueDate(d?.isValid ? d.toDate() : null)}
              calendarPosition="bottom-right"
              placeholder="انتخاب تاریخ"
            />
            <p className={`${HINT} mt-1`}>بقیه اقساط هر ماه یه بار از این تاریخ جلو میرن</p>
          </div>

          {/* توضیحات */}
          <div>
            <label className={LABEL}>توضیحات (اختیاری)</label>
            <textarea
              rows={2}
              placeholder="مثال: وام ۳۶ ماهه بانک ملت شعبه مرکزی"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT} text-right resize-none`}
            />
          </div>

          {/* خطا */}
          {error && (
            <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] rounded-xl px-4 py-3">
              <p className="text-xs text-[color:var(--danger)] text-right">{error}</p>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              ثبت وام و ساخت اقساط
            </button>
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
