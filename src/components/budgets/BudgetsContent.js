"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  PiggyBank,
  Loader2,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { sanitizeDigits } from "@/utils/formatters";

const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

// دسته‌هایی که «درآمد» هستند و بودجه‌ی هزینه برایشان معنی ندارد
const INCOME_CATEGORY_IDS = ["salary", "freelance"];

const toPersianNum = (n) => Number(n).toLocaleString("fa-IR", { useGrouping: false });

// نمایش مبلغ با جداکننده‌ی هزارگان (مقدار واقعی state فقط رقم می‌ماند)
const formatAmount = (digits) => (digits ? Number(digits).toLocaleString("en-US") : "");

const barColor = (pct) =>
  pct >= 100 ? "var(--danger)" : pct >= 80 ? "var(--warning)" : "var(--brand)";

export default function BudgetsContent() {
  const router = useRouter();
  const { currency, display, unit } = useCurrency();

  // null = ماه جاری (سرور تشخیص می‌دهد)
  const [requestedMonth, setRequestedMonth] = useState(null);
  const [month, setMonth] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // فرم ساخت/ویرایش
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [limitText, setLimitText] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // ── دریافت داده ──
  const fetchBudgets = useCallback(async () => {
    try {
      const params = requestedMonth
        ? { jy: requestedMonth.jy, jm: requestedMonth.jm }
        : undefined;
      const res = await api.get("/budgets", { params });
      setMonth({ jy: res.data.jy, jm: res.data.jm });
      setBudgets(res.data.budgets ?? []);
      setFetchError(null);
    } catch (err) {
      if (err.response?.status === 401) { router.push("/"); return; }
      setFetchError("خطا در دریافت بودجه‌ها");
    } finally {
      setLoading(false);
    }
  }, [requestedMonth, router]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  useEffect(() => {
    api.get("/finance/categories")
      .then((res) => setCategories(res.data.categories ?? []))
      .catch(() => {});
  }, []);

  // ── ناوبری ماه (مثل MonthSelector گزارش‌ها: سمت راست = جلو) ──
  const shiftMonth = (delta) => {
    if (!month) return;
    let jy = month.jy;
    let jm = month.jm + delta;
    if (jm > 12) { jm = 1; jy += 1; }
    if (jm < 1) { jm = 12; jy -= 1; }
    setLoading(true);
    setRequestedMonth({ jy, jm });
  };

  // ── مبلغ: کاربر به واحد نمایشی (تومان/ریال) وارد می‌کند، سرور ریال نگه می‌دارد ──
  const toRial = (n) => (currency === "IRT" ? n * 10 : n);
  const fromRial = (n) => (currency === "IRT" ? Math.round(n / 10) : n);
  const limitNumber = Number(limitText || 0);

  // ── فرم ──
  const budgetedIds = useMemo(() => new Set(budgets.map((b) => b.categoryId)), [budgets]);
  const availableCategories = categories.filter(
    (c) => !INCOME_CATEGORY_IDS.includes(c.id) && !budgetedIds.has(c.id)
  );

  const openCreate = () => {
    setEditing(null);
    setCategoryId(null);
    setLimitText("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setCategoryId(b.categoryId);
    setLimitText(String(fromRial(b.limit)));
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = useCallback(() => {
    if (formLoading) return;
    setFormOpen(false);
  }, [formLoading]);

  // Escape + قفل اسکرول صفحه وقتی مودال بازه
  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeForm(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [formOpen, closeForm]);

  const handleSubmit = async () => {
    setFormError(null);
    if (!categoryId) { setFormError("یک دسته‌بندی انتخاب کنید"); return; }
    if (!limitNumber || limitNumber <= 0) { setFormError("سقف بودجه را وارد کنید"); return; }
    if (!month) return;

    setFormLoading(true);
    try {
      await api.put("/budgets", {
        categoryId,
        limit: toRial(limitNumber),
        jy: month.jy,
        jm: month.jm,
      });
      setFormOpen(false);
      await fetchBudgets();
    } catch (err) {
      setFormError(err.response?.data?.message || "خطا در ذخیره بودجه");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`بودجه‌ی «${b.label}» حذف شود؟`)) return;
    try {
      await api.delete(`/budgets/${b.id}`);
      setBudgets((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      alert(err.response?.data?.message || "خطا در حذف بودجه");
    }
  };

  // ── جمع کل ──
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const monthTitle = month ? `${MONTH_NAMES[month.jm - 1]} ${toPersianNum(month.jy)}` : "";

  if (loading && !month) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={32} />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)] p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[color:var(--ink)]">بودجه‌بندی</h1>
          <button
            onClick={openCreate}
            disabled={!month}
            className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> بودجه جدید
          </button>
        </div>

        {/* انتخاب ماه */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={() => shiftMonth(1)}
            aria-label="ماه بعد"
            className="p-1 text-[color:var(--ink)] hover:text-[color:var(--brand)] transition-colors"
          >
            <ChevronRight size={22} />
          </button>
          <span className="text-base font-bold text-[color:var(--ink)]">{monthTitle}</span>
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="ماه قبل"
            className="p-1 text-[color:var(--ink)] hover:text-[color:var(--brand)] transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        {fetchError && (
          <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] text-[color:var(--danger)] text-xs rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <span>{fetchError}</span>
            <button
              onClick={() => { setLoading(true); fetchBudgets(); }}
              className="font-semibold underline"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
          </div>
        ) : (
          <>
            {/* خلاصه */}
            {budgets.length > 0 && (
              <div className="bg-[var(--card)] border border-[color:var(--border)] rounded-2xl p-4 mb-4 space-y-2">
                <p className="text-xs text-[color:var(--muted)]">مصرف کل بودجه‌ها</p>
                <p className="text-[15px] font-bold text-[color:var(--ink)]">
                  {display(totalSpent)} از {display(totalLimit)} {unit}
                </p>
                <ProgressBar pct={totalPct} />
                <p className="text-xs text-[color:var(--muted)]">{toPersianNum(totalPct)}٪ مصرف شده</p>
              </div>
            )}

            {/* لیست */}
            {budgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-5">
                <PiggyBank size={44} className="text-[color:var(--muted-light)] opacity-60" />
                <h3 className="text-sm font-bold text-[color:var(--ink)]">برای این ماه بودجه‌ای تعیین نکردی</h3>
                <p className="text-xs text-[color:var(--muted)] text-center leading-6 max-w-xs">
                  برای هر دسته یک سقف ماهانه بگذار تا مصرفت را در طول ماه دنبال کنی.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.map((b) => {
                  const over = b.spent > b.limit;
                  return (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEdit(b)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(b); } }}
                      className="bg-[var(--card)] border border-[color:var(--border)] hover:bg-[var(--hover)] rounded-2xl p-3.5 space-y-2.5 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 flex items-center gap-2.5">
                          <span className="text-[22px] leading-none">{b.icon || "🏷️"}</span>
                          <span className="flex-1 truncate text-[15px] font-bold text-[color:var(--ink)]">{b.label}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(b); }}
                          aria-label={`حذف بودجه ${b.label}`}
                          className="p-1 text-[color:var(--danger)] hover:opacity-70 transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <ProgressBar pct={b.percentage} />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[color:var(--muted)]">
                          {display(b.spent)} از {display(b.limit)} {unit}
                        </span>
                        <span className="text-[13px] font-bold" style={{ color: barColor(b.percentage) }}>
                          {toPersianNum(b.percentage)}٪
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: over ? "var(--danger)" : "var(--muted)" }}>
                        {over
                          ? `${display(b.spent - b.limit)} ${unit} بیشتر از سقف`
                          : `${display(b.remaining)} ${unit} باقی مانده`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={openCreate}
              disabled={!month}
              className="w-full mt-4 flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[color:var(--brand)] text-[color:var(--brand)] hover:bg-[var(--brand-light)] rounded-2xl py-3.5 text-sm font-bold transition-colors"
            >
              <Plus size={20} /> بودجه جدید
            </button>
          </>
        )}
      </div>

      {/* مودال ساخت / ویرایش */}
      {formOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={closeForm}
          role="dialog"
          aria-modal="true"
          aria-label={editing ? `ویرایش بودجه ${editing.label}` : "بودجه جدید"}
        >
          <style>{`
            @keyframes budgetSheetUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .budget-sheet { animation: budgetSheetUp .22s ease-out; }
            @media (prefers-reduced-motion: reduce) { .budget-sheet { animation: none; } }
          `}</style>
          <div
            className="budget-sheet w-full sm:max-w-md bg-[var(--card)] border border-[color:var(--border)] rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="flex-1 truncate text-base font-bold text-[color:var(--ink)] text-right">
                {editing ? `ویرایش بودجه‌ی ${editing.label}` : `بودجه‌ی جدید برای ${monthTitle}`}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="بستن"
                className="text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* انتخاب دسته (فقط هنگام ساخت) */}
            {!editing && (
              <div className="mb-4">
                <label className={LABEL}>دسته‌بندی</label>
                {availableCategories.length === 0 ? (
                  <p className="text-xs text-[color:var(--muted)] text-right">برای همه‌ی دسته‌ها بودجه تعیین شده است.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableCategories.map((c) => {
                      const on = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategoryId(c.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-colors"
                          style={{
                            border: `1px solid ${on ? "var(--brand)" : "var(--input-border)"}`,
                            backgroundColor: on ? "var(--brand-light)" : "var(--input-bg)",
                            color: on ? "var(--brand)" : "var(--ink)",
                            fontWeight: on ? 700 : 400,
                          }}
                        >
                          <span className="text-sm">{c.icon}</span>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <label className={LABEL}>سقف ماهانه ({unit})</label>
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              autoFocus
              maxLength={20}
              placeholder="مثلاً 2,000,000"
              value={formatAmount(limitText)}
              onChange={(e) => { setLimitText(sanitizeDigits(e.target.value)); setFormError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !formLoading && handleSubmit()}
              className={`${INPUT} text-left tracking-wider`}
            />
            {limitNumber > 0 && (
              <p className="text-xs text-[color:var(--muted)] text-right mt-2">
                {limitNumber.toLocaleString("fa-IR")} {unit}
              </p>
            )}

            {formError && <p className="text-xs text-[color:var(--danger)] text-right mt-3">{formError}</p>}

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={formLoading}
                className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                {editing ? "ذخیره تغییرات" : "ثبت بودجه"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="bg-[var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-5 py-3 text-sm hover:opacity-80 transition-opacity"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// نوار پیشرفت (در RTL از راست پر می‌شود)
function ProgressBar({ pct }) {
  return (
    <div
      className="h-2 rounded-full bg-[var(--border)] overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(pct, 100)}
    >
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor(pct) }}
      />
    </div>
  );
}