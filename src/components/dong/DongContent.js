"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Users, Plus, Trash2, RotateCcw, Save, Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { toEnglishDigits } from "@/utils/formatters";

const FINANCE_PREFIX = "/finance"; // baseURL از قبل شامل /api است
const MIN_PEOPLE = 2;
const MAX_PEOPLE = 30;
// سقف ورودی: ۱۳ رقم، تا جمع ۳۰ نفر و تبدیل به ریال از حد امن عدد صحیح رد نشه
const MAX_AMOUNT = 9_999_999_999_999;

/* ───────── helpers ───────── */
const toPersianNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const parseAmount = (s) => {
  const digits = toEnglishDigits(s).replace(/[^\d]/g, "").slice(0, 13);
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : Math.min(n, MAX_AMOUNT);
};

const formatMoney = (n) => toPersianNum(Math.abs(n).toLocaleString("en-US"));

// برچسب کوتاه برای دکمه‌های سریع: ۵۰ هزار / ۱ میلیون
const shortAmount = (n) => {
  if (n >= 1_000_000 && n % 1_000_000 === 0) return `${toPersianNum(n / 1_000_000)} میلیون`;
  if (n >= 1_000 && n % 1_000 === 0) return `${toPersianNum(n / 1_000)} هزار`;
  return formatMoney(n);
};

// محاسبه‌ی لحظه‌ای سهم و تراز (همان منطق بک‌اند: عدد صحیح + پخش باقی‌مانده)
function computeLocal(people) {
  const n = people.length;
  const total = people.reduce((s, p) => s + p.paid, 0);
  const base = Math.floor(total / n);
  let remainder = total - base * n;
  const rows = people.map((p) => {
    const share = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    return { id: p.id, share, balance: p.paid - share };
  });
  return { total, rows };
}

/* ───────── Component ───────── */
export default function DongContent() {
  const router = useRouter();
  const { currency, unit } = useCurrency();

  const isRial = currency === "IRR";
  const unitMul = isRial ? 10 : 1;
  // دکمه‌های سریع: ۵۰ هزار، ۱۰۰ هزار، ۵۰۰ هزار، ۱ میلیون تومان (در حالت ریال ×۱۰)
  const quickAmounts = [50_000, 100_000, 500_000, 1_000_000].map((a) => a * unitMul);
  // بک‌اند همیشه ریال ذخیره می‌کند؛ مبالغ این صفحه به واحد انتخابی کاربر هستند
  const toRialFactor = isRial ? 1 : 10;

  const nextId = useRef(3);
  const [people, setPeople] = useState([
    { id: 1, name: "", paid: 0 },
    { id: 2, name: "", paid: 0 },
  ]);
  const [settlements, setSettlements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [myId, setMyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }
  const reqId = useRef(0);

  const { total, rows } = useMemo(() => computeLocal(people), [people]);
  const equalShare = rows[0]?.share ?? 0;

  const displayName = (p, idx) => p.name.trim() || `شخص ${toPersianNum(idx + 1)}`;

  // کلید تغییرات: فقط id و مبلغ؛ تغییر نام باعث درخواست جدید نمی‌شود
  const paidKey = people.map((p) => `${p.id}:${p.paid}`).join("|");

  // ── محاسبه خودکار تسویه (debounce) ──
  useEffect(() => {
    if (total <= 0) {
      reqId.current++; // درخواست در جریان (اگر هست) را باطل کن
      setSettlements(null);
      setCalcError(null);
      setLoading(false);
      return undefined;
    }

    const myReq = reqId.current;
    setLoading(true);
    setCalcError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await api.post(`${FINANCE_PREFIX}/dong/calculate`, {
          // به‌جای نام، id را می‌فرستیم تا نام تکراری مشکلی ایجاد نکند
          participants: people.map((p) => ({ name: String(p.id), paid: p.paid })),
        });
        if (myReq !== reqId.current) return; // جواب قدیمی
        setSettlements(res.data.settlements);
      } catch (e) {
        if (myReq !== reqId.current) return;
        setSettlements(null);
        setCalcError(e?.response?.data?.message || "خطا در محاسبه تسویه");
      } finally {
        if (myReq === reqId.current) setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      reqId.current++; // درخواست‌های در جریان را باطل می‌کند
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidKey]);

  // پیام موفقیت/خطا بعد از چند ثانیه محو شود
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const update = (id, patch) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addPerson = () => {
    if (people.length >= MAX_PEOPLE) {
      setNotice({ type: "error", text: `حداکثر ${toPersianNum(MAX_PEOPLE)} نفر مجاز است.` });
      return;
    }
    setPeople((prev) => [...prev, { id: nextId.current++, name: "", paid: 0 }]);
  };

  const removePerson = (id) => {
    if (people.length <= MIN_PEOPLE) {
      setNotice({ type: "error", text: "حداقل دو نفر لازم است." });
      return;
    }
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (myId === id) setMyId(null);
  };

  const resetAll = () => setPeople((prev) => prev.map((p) => ({ ...p, paid: 0 })));

  // ── ثبت سهم من به‌عنوان خرج ──
  const handleSaveMyShare = async () => {
    const idx = people.findIndex((p) => p.id === myId);
    if (idx < 0) return;
    const myShare = rows[idx].share;
    if (myShare <= 0) {
      setNotice({ type: "error", text: "سهم شما صفر است." });
      return;
    }

    // تبدیل به ریال برای بک‌اند (در حالت تومان ×۱۰)
    const myShareInRial = myShare * toRialFactor;
    if (!Number.isSafeInteger(myShareInRial)) {
      setNotice({ type: "error", text: "مبلغ واردشده معتبر نیست." });
      return;
    }

    try {
      setSaving(true);
      await api.post(`${FINANCE_PREFIX}/dong/save`, { title: "دنگ", myShare: myShareInRial });
      setNotice({ type: "success", text: "سهم شما به‌عنوان خرج ثبت شد." });
    } catch (e) {
      setNotice({ type: "error", text: e?.response?.data?.message || "خطا در ثبت. دوباره تلاش کنید." });
    } finally {
      setSaving(false);
    }
  };

  // نگاشت id → نام برای نمایش نتیجه
  const nameById = new Map(people.map((p, i) => [String(p.id), displayName(p, i)]));

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)]">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">

        {/* هدر */}
        <div className="flex items-center mb-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={15} /> بازگشت
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-[color:var(--ink)]">محاسبه دنگی</h1>
          <button
            onClick={resetAll}
            aria-label="پاک کردن همه مبالغ"
            title="پاک کردن همه مبالغ"
            className="text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* پیام */}
        {notice && (
          <div
            role="status"
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
              notice.type === "success"
                ? "bg-[var(--emerald-bg)] text-[color:var(--emerald-text)] border-[color:var(--border)]"
                : "bg-[var(--danger-light)] text-[color:var(--danger)] border-[color:var(--danger-border)]"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* کارت خلاصه */}
        <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center shrink-0">
              <Users size={22} className="text-[color:var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[color:var(--muted)]">جمع کل هزینه‌ها</p>
              <p className="text-xl font-extrabold text-[color:var(--ink)] mt-0.5 truncate">
                {formatMoney(total)} {unit}
              </p>
            </div>
            <span className="bg-[var(--brand-light)] text-[color:var(--brand)] text-sm font-bold rounded-xl px-3 py-1.5">
              {toPersianNum(people.length)} نفر
            </span>
          </div>

          <div className="h-px bg-[var(--border)] my-3.5" />

          <div className="flex justify-between">
            <div>
              <p className="text-xs text-[color:var(--muted)]">سهم مساوی هر نفر</p>
              <p className="text-base font-bold text-[color:var(--brand)] mt-1">
                {formatMoney(equalShare)} {unit}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-[color:var(--muted)]">تعداد تسویه‌ها</p>
              <p className="text-base font-bold text-[color:var(--ink)] mt-1">
                {settlements ? `${toPersianNum(settlements.length)} پرداخت` : loading ? "..." : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* عنوان لیست */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[color:var(--ink)]">اعضای گروه و مبالغ پرداختی</h2>
          <button
            onClick={addPerson}
            className="flex items-center gap-1.5 bg-[var(--brand)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
          >
            <Plus size={14} /> افزودن شخص
          </button>
        </div>

        {/* کارت هر نفر */}
        {people.map((p, idx) => {
          const row = rows[idx];
          const isCreditor = row.balance > 0;
          const isDebtor = row.balance < 0;
          return (
            <div
              key={p.id}
              className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-3.5 mb-3"
            >
              <div className="flex items-center gap-3">
                <input
                  value={p.name}
                  onChange={(e) => update(p.id, { name: e.target.value })}
                  placeholder={`شخص ${toPersianNum(idx + 1)}`}
                  maxLength={30}
                  className="flex-1 min-w-0 bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3 py-2.5 text-[15px] text-[color:var(--ink)] placeholder:text-[color:var(--muted)] outline-none focus:border-[color:var(--brand)] transition-colors"
                />
                <button
                  onClick={() => removePerson(p.id)}
                  aria-label={`حذف ${displayName(p, idx)}`}
                  className="text-[color:var(--danger)] hover:opacity-70 transition-opacity p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2.5 bg-[var(--bg)] border border-[color:var(--border)] rounded-xl px-3">
                <span className="text-[13px] text-[color:var(--muted)] shrink-0">مبلغ پرداختی:</span>
                <input
                  value={p.paid ? formatMoney(p.paid) : ""}
                  onChange={(e) => update(p.id, { paid: parseAmount(e.target.value) })}
                  placeholder="۰"
                  inputMode="numeric"
                  dir="ltr"
                  className="flex-1 min-w-0 bg-transparent text-left text-[17px] font-bold text-[color:var(--brand)] py-3 outline-none placeholder:text-[color:var(--muted)]"
                />
                <span className="text-xs text-[color:var(--muted)] shrink-0">{unit}</span>
              </div>

              {/* دکمه‌های سریع */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => update(p.id, { paid: Math.min(p.paid + amt, MAX_AMOUNT) })}
                    className="rounded-[10px] border border-[color:var(--border)] bg-[var(--bg)] hover:bg-[var(--hover)] px-2.5 py-1 text-xs font-semibold text-[color:var(--muted)] transition-colors"
                  >
                    +{shortAmount(amt)} {unit}
                  </button>
                ))}
                <button
                  onClick={() => update(p.id, { paid: 0 })}
                  className="rounded-[10px] border border-[color:var(--border)] bg-[var(--bg)] hover:bg-[var(--hover)] px-2.5 py-1 text-xs font-semibold text-[color:var(--muted)] transition-colors"
                >
                  پاک کردن
                </button>
              </div>

              {/* سهم و تراز */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[color:var(--muted)]">
                  سهم: {formatMoney(row.share)} {unit}
                </span>
                <span
                  className={`rounded-[10px] px-2.5 py-1.5 text-xs font-bold ${
                    isCreditor
                      ? "bg-[var(--brand-light)] text-[color:var(--brand)]"
                      : isDebtor
                      ? "bg-[var(--danger-light)] text-[color:var(--danger)]"
                      : "bg-[var(--bg)] text-[color:var(--muted)]"
                  }`}
                >
                  {isCreditor
                    ? `طلبکار: ${formatMoney(row.balance)} ${unit}`
                    : isDebtor
                    ? `بدهکار: ${formatMoney(row.balance)} ${unit}`
                    : "تسویه"}
                </span>
              </div>
            </div>
          );
        })}

        {/* نتیجه تسویه */}
        {total > 0 && (
          <div
            className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mt-4 transition-opacity ${
              loading && settlements ? "opacity-60" : ""
            }`}
          >
            <h2 className="text-[15px] font-bold text-[color:var(--ink)] mb-2.5">نتیجه تسویه</h2>

            {calcError ? (
              <p className="text-sm text-center text-[color:var(--danger)] py-2">{calcError}</p>
            ) : !settlements ? (
              <div className="flex justify-center py-3">
                <Loader2 size={22} className="animate-spin text-[color:var(--brand)]" />
              </div>
            ) : settlements.length === 0 ? (
              <p className="text-sm text-center text-[color:var(--muted)] py-2">حساب همه صاف است 🎉</p>
            ) : (
              settlements.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-[color:var(--border)] last:border-b-0"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
                    <span>{nameById.get(s.from) ?? s.from}</span>
                    <ArrowLeft size={14} className="text-[color:var(--muted)]" />
                    <span>{nameById.get(s.to) ?? s.to}</span>
                  </div>
                  <span className="text-sm font-bold text-[color:var(--brand)]">
                    {formatMoney(s.amount)} {unit}
                  </span>
                </div>
              ))
            )}

            {/* ثبت سهم من */}
            <div className="h-px bg-[var(--border)] my-3.5" />
            <p className="text-xs text-[color:var(--muted)] mb-2.5">
              سهم خودت را به‌عنوان خرج ثبت کن — تو کدام نفری؟
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {people.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setMyId(p.id)}
                  className={`rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    myId === p.id
                      ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
                      : "bg-[var(--bg)] border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[var(--hover)]"
                  }`}
                >
                  {displayName(p, idx)}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveMyShare}
              disabled={myId === null || saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-[var(--brand-light)] text-[color:var(--brand)] text-sm font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} /> ثبت سهم من در خرج‌ها
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}