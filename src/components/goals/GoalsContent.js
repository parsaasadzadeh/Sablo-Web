"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Target, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import { useTheme } from "@/context/themeContext";
import GoalCard from "@/components/reports/GoalCard";
import PayInstallmentModal from "@/components/dashboard/PayInstallmentModal";

const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)] text-right";

const formatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly).toLocaleString("en-US") : "";
};
const unformatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

export default function GoalsContent() {
  const router = useRouter();
  const { display, unit, currency } = useCurrency();
  const { cards } = useCard();
  const { mode } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // ── واریز به هدف ──
  const [depositGoal,   setDepositGoal]   = useState(null); // هدفی که مودال برایش باز است
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError,  setDepositError]  = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data.goals);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !amount || !deadline) {
      setError("همه فیلدها الزامی هستند");
      return;
    }
    const numericAmount = Number(amount.replace(/,/g, ""));
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;
    // deadline یک آبجکت Date هست (از DatePicker شمسی) — قبل از ارسال به ISO تبدیل میشه
    const formattedDeadline = new Date(deadline).toISOString();
    setFormLoading(true);
    try {
      await api.post("/goals", { title, targetAmount: amountInRial, deadline: formattedDeadline });
      setTitle(""); setAmount(""); setDeadline("");
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هدف حذف شود؟")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch {
      alert("خطا در حذف هدف");
    }
  };

  const openDeposit = (goal) => {
    setDepositGoal(goal);
    setDepositAmount("");
    setDepositError(null);
  };

  const closeDeposit = () => {
    setDepositGoal(null);
    setDepositAmount("");
    setDepositError(null);
  };

  // ── انتخاب کارت در PayInstallmentModal = تأیید واریز ──
  // ⚠️ مسیر و بدنه‌ی درخواست را با API بک‌اند / نسخه‌ی موبایل خودتان هماهنگ کنید
  const handleConfirmDeposit = async (cardId) => {
    const value = unformatAmount(depositAmount);
    if (value <= 0) {
      setDepositError("مبلغ واریز را وارد کنید");
      return; // مودال باز می‌ماند
    }
    const amountInRial = currency === "IRT" ? value * 10 : value;
    try {
      await api.post(`/goals/${depositGoal._id}/deposit`, {
        amount: amountInRial,
        cardId: cardId ?? null,
      });
      closeDeposit();
      fetchGoals();
    } catch (err) {
      setDepositError(err.response?.data?.message || "خطا در واریز به هدف");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={32} />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)] p-4 sm:p-8 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: var(--amber-bg) !important; color: var(--ink) !important; border: 1px solid var(--warning-border) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; text-align: right !important; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[color:var(--ink)]">اهداف مالی</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> هدف جدید
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-5 mb-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-[color:var(--ink)] text-right">هدف مالی جدید</h3>
            <div>
              <label className={LABEL}>عنوان</label>
              <input
                type="text"
                placeholder="مثال: پس‌انداز خرید ماشین"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>مبلغ هدف ({unit})</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={`مبلغ را به ${unit} وارد کنید`}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--amber-text)] mb-1.5 text-right">
                ددلاین (شمسی)
              </label>
              <DatePicker
                className={mode === "dark" ? "bg-dark" : ""}
                calendar={persian}
                locale={persian_fa}
                value={deadline}
                onChange={(dateObject) => setDeadline(dateObject?.isValid ? dateObject.toDate() : "")}
                minDate={new Date()}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ"
              />
            </div>
            {error && <p className="text-xs text-[color:var(--danger)] text-right">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                ذخیره هدف
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={48} className="text-[color:var(--muted-light)] opacity-50" />
            <h3 className="text-base font-bold text-[color:var(--ink)]">هنوز هدفی ندارید</h3>
            <p className="text-sm text-[color:var(--muted)] text-center max-w-xs leading-6">
              با تعریف هدف مالی، اپ پیشرفت شما رو دنبال میکنه و پیش‌بینی میده
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-semibold px-6 py-3 rounded-xl mt-2 transition-colors"
            >
              اولین هدفم رو بسازم
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              display={display}
              unit={unit}
              onDelete={handleDelete}
              onDeposit={openDeposit}
            />
          ))
        )}
      </div>

      {/* واریز به هدف: همان مودال انتخاب کارت پرداخت قسط */}
      <PayInstallmentModal
        visible={Boolean(depositGoal)}
        onClose={closeDeposit}
        onConfirm={handleConfirmDeposit}
        cards={cards}
        title="واریز به هدف از کدام کارت؟"
        subtitle={depositGoal ? `هدف «${depositGoal.title}» — مبلغ رو وارد کن و کارت رو انتخاب کن` : ""}
      >
        <div className="mb-4">
          <label className={LABEL}>مبلغ واریز ({unit})</label>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            autoFocus
            placeholder="مثال: 5,000,000"
            value={depositAmount}
            onChange={(e) => { setDepositAmount(formatAmount(e.target.value)); setDepositError(null); }}
            className={`${INPUT} tracking-wider text-left`}
          />
          {depositError && (
            <p className="text-xs text-[color:var(--danger)] text-right mt-2">{depositError}</p>
          )}
        </div>
      </PayInstallmentModal>
    </div>
  );
}
