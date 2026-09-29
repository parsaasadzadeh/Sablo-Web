"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  User,
  CreditCard,
  Coins,
  Bell,
  BellRing,
  BellOff,
  LogOut,
  X,
  CheckCircle2,
  Smartphone,
  Hash,
  Wifi,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import api from "@/lib/axios";
import { CurrencyProvider, useCurrency } from "@/context/currencyContext";

const RUBIKA_BOT_URL = "https://rubika.ir/SabloFinanceBot";
const THEME_KEY = "sablo_theme";

/* ───────── راهنمای گام‌به‌گام ───────── */
const STEPS = [
  {
    icon: Smartphone,
    tone: "text-sky-600 bg-sky-50",
    title: "ورود به روبیکا",
    desc: "اپلیکیشن روبیکا را باز کنید. اگر حساب ندارید ابتدا ثبت‌نام کنید.",
    warning: null,
  },
  {
    icon: Hash,
    tone: "text-violet-600 bg-violet-50",
    title: "جستجوی ربات",
    desc: "در قسمت جستجو، نام «SabloFinanceBot» را تایپ کنید یا روی دکمه «رفتن به ربات» بزنید.",
    warning: null,
  },
  {
    icon: CheckCircle2,
    tone: "text-[#0F6F5C] bg-[#E6F3EF]",
    title: "ارسال استارت",
    desc: "وارد ربات شوید و دکمه «شروع / Start» را لمس کنید تا ربات فعال شود.",
    warning: null,
  },
  {
    icon: Hash,
    tone: "text-amber-600 bg-amber-50",
    title: "وارد کردن شماره موبایل",
    desc: "شماره موبایلی که با آن در سابلو ثبت‌نام کرده‌اید را دقیقاً وارد کنید تا ربات حسابتان را شناسایی کند.",
    warning: "شماره موبایل باید دقیقاً همان شماره‌ای باشد که در سابلو ثبت کرده‌اید.",
  },
  {
    icon: Wifi,
    tone: "text-red-600 bg-red-50",
    title: "قطع نکردن ربات",
    desc: "پس از راه‌اندازی، ربات را بلاک یا حذف نکنید. در غیر این صورت اعلان‌ها ارسال نخواهند شد.",
    warning: "گزینه «قطع اتصال» یا «Block» را نزنید — اعلان‌های سررسید قطع می‌شوند.",
  },
];

const toPersianNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/* ───────── مودال راهنما ───────── */
function RubikaGuideModal({ open, onClose, onGoToBot }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full sm:max-w-lg h-[88vh] sm:h-auto sm:max-h-[85vh] bg-white dark:bg-[#1E1D1A] rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* هدر */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#EDE8DC] dark:border-[#3A3832]">
          <div>
            <h2 className="text-base font-bold text-[#26241F] dark:text-[#F3F0E8]">راهنمای فعال‌سازی اعلان</h2>
            <p className="text-xs text-[#8A8273] mt-0.5">ربات یادآوری اقساط روبیکا</p>
          </div>
          <button onClick={onClose} aria-label="بستن" className="p-1.5 rounded-full hover:bg-black/5">
            <X size={22} className="text-[#8A8273]" />
          </button>
        </div>

        {/* هشدار */}
        <div className="flex items-center gap-2 mx-4 mt-3.5 mb-1 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs font-semibold text-amber-700 leading-5">
            برای استفاده از این قابلیت حتماً باید حساب روبیکا داشته باشید.
          </p>
        </div>

        {/* گام‌ها */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center w-9 shrink-0">
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${step.tone}`}>
                    <Icon size={18} />
                  </div>
                  {idx < STEPS.length - 1 && <div className="flex-1 w-0.5 bg-[#EDE8DC] my-1 min-h-5" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#0F6F5C] bg-[#E6F3EF] rounded-md px-1.5 py-0.5">
                      گام {toPersianNum(idx + 1)}
                    </span>
                    <span className="text-sm font-bold text-[#26241F] dark:text-[#F3F0E8]">{step.title}</span>
                  </div>
                  <p className="text-[13px] text-[#8A8273] leading-[21px]">{step.desc}</p>
                  {step.warning && (
                    <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-[11px] font-semibold text-red-600 leading-[18px]">{step.warning}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* فوتر */}
        <div className="px-5 pt-3 pb-5 border-t border-[#EDE8DC] dark:border-[#3A3832]">
          <button
            onClick={onGoToBot}
            className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-[15px] font-bold transition-colors"
          >
            رفتن به ربات روبیکا
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── ردیف‌های تنظیمات ───────── */
function Row({ icon, iconBg, label, sub, onClick, children, danger }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 text-right bg-white dark:bg-[#1E1D1A] rounded-[14px] px-4 py-3.5 mb-2.5 border border-[#EDE8DC] dark:border-[#3A3832] ${
        onClick ? "hover:bg-[#FBF9F4] dark:hover:bg-[#262521] transition-colors" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${danger ? "text-red-600" : "text-[#26241F] dark:text-[#F3F0E8]"}`}>
            {label}
          </div>
          {sub}
        </div>
      </div>
      {children ?? (onClick && !danger ? <ChevronRight size={18} className="text-[#8A8273] rotate-180" /> : null)}
    </Tag>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-colors ${
        active
          ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
          : "bg-[#F7F4EE] dark:bg-[#141311] border-[#EDE8DC] dark:border-[#3A3832] text-[#8A8273]"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────── محتوای اصلی ───────── */
function SettingsContent({ user }) {
  const router = useRouter();
  const { currency, changeCurrency } = useCurrency();
  const [guideOpen, setGuideOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [notifState, setNotifState] = useState("loading"); // loading | granted | denied | unsupported
  const [toast, setToast] = useState(null);

  // تم
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    setTheme(saved === "dark" ? "dark" : "light");
  }, []);

  const applyTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem(THEME_KEY, mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.setAttribute("data-theme", mode);
  };

  // وضعیت اعلان مرورگر
  const refreshNotif = useCallback(() => {
    if (typeof Notification === "undefined") return setNotifState("unsupported");
    setNotifState(Notification.permission === "granted" ? "granted" : "denied");
  }, []);

  useEffect(() => {
    refreshNotif();
    const onVis = () => document.visibilityState === "visible" && refreshNotif();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshNotif]);

  const showToast = (msg, variant = "success") => {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNotifications = async () => {
    if (notifState === "unsupported") {
      return showToast("مرورگر شما از اعلان پشتیبانی نمی‌کند.", "danger");
    }
    if (notifState === "granted") {
      return showToast("اعلان‌های سابلو فعال است و یادآوری سررسید اقساط برای شما ارسال می‌شود.");
    }
    const result = await Notification.requestPermission();
    refreshNotif();
    if (result === "granted") {
      showToast("از این پس سررسید اقساط و وام‌های شما یادآوری می‌شود.");
    } else {
      showToast(
        "اجازه‌ی نمایش اعلان داده نشد. اگر قبلاً مسدود کرده‌اید، از تنظیمات مرورگر (آیکن قفل کنار آدرس) آن را فعال کنید.",
        "danger"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // ← در صورت متفاوت بودن مسیر لاگ‌اوت تغییر بده
    } catch {}
    router.replace("/");
  };

  const openRubikaBot = () => {
    setGuideOpen(false);
    window.open(RUBIKA_BOT_URL, "_blank", "noopener,noreferrer");
  };

  const notifEnabled = notifState === "granted";
  const notifStatusText =
    notifState === "loading"
      ? "..."
      : notifState === "unsupported"
      ? "پشتیبانی نمی‌شود"
      : notifEnabled
      ? "فعال"
      : "غیرفعال (برای فعال‌سازی کلیک کنید)";

  return (
    <div className="min-h-screen bg-[#F7F4EE] dark:bg-[#141311]">
      {/* هدر */}
      <header className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#1E1D1A] border-b border-[#EDE8DC] dark:border-[#3A3832]">
        <button onClick={() => router.back()} aria-label="بازگشت" className="p-1 w-8">
          <ChevronRight size={24} className="text-[#26241F] dark:text-[#F3F0E8]" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[#26241F] dark:text-[#F3F0E8]">تنظیمات</h1>
        <div className="w-8" />
      </header>

      <main className="max-w-xl mx-auto p-4 pb-10">
        {/* پروفایل */}
        <section className="flex items-center gap-3 bg-white dark:bg-[#1E1D1A] rounded-2xl p-4 mb-4 border border-[#EDE8DC] dark:border-[#3A3832]">
          <div className="w-12 h-12 rounded-full bg-[#E6F3EF] flex items-center justify-center">
            <User size={22} className="text-[#0F6F5C]" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#26241F] dark:text-[#F3F0E8]">{user?.name || "کاربر"}</div>
            {user?.phone && (
              <div dir="ltr" className="text-xs text-[#8A8273] mt-0.5 text-right">
                {user.phone}
              </div>
            )}
          </div>
        </section>

        {/* مدیریت کارت‌ها */}
        <Row
          onClick={() => router.push("/cards")}
          label="مدیریت کارت‌ها"
          iconBg="bg-[#E6F3EF]"
          icon={<CreditCard size={18} className="text-[#0F6F5C]" />}
        />

        {/* ظاهر برنامه */}
        <Row
          label="ظاهر برنامه"
          iconBg="bg-amber-50"
          icon={
            theme === "dark" ? (
              <Moon size={18} className="text-amber-600" />
            ) : (
              <Sun size={18} className="text-amber-600" />
            )
          }
        >
          <div className="flex gap-1.5">
            <Chip active={theme === "light"} onClick={() => applyTheme("light")}>
              <Sun size={13} /> روشن
            </Chip>
            <Chip active={theme === "dark"} onClick={() => applyTheme("dark")}>
              <Moon size={13} /> تاریک
            </Chip>
          </div>
        </Row>

        {/* واحد پول */}
        <Row label="واحد پول" iconBg="bg-amber-50" icon={<Coins size={18} className="text-amber-600" />}>
          <div className="flex gap-1.5">
            <Chip active={currency === "IRT"} onClick={() => changeCurrency("IRT")}>
              تومان
            </Chip>
            <Chip active={currency === "IRR"} onClick={() => changeCurrency("IRR")}>
              ریال
            </Chip>
          </div>
        </Row>

        {/* اعلان‌های مرورگر */}
        <Row
          onClick={handleNotifications}
          label="اعلان‌های مرورگر"
          iconBg={notifEnabled ? "bg-[#E6F3EF]" : "bg-red-50"}
          icon={
            notifEnabled ? (
              <BellRing size={18} className="text-[#0F6F5C]" />
            ) : (
              <BellOff size={18} className="text-red-600" />
            )
          }
          sub={
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${notifEnabled ? "bg-[#0F6F5C]" : "bg-red-600"}`} />
              <span className={`text-[11px] font-semibold ${notifEnabled ? "text-[#0F6F5C]" : "text-red-600"}`}>
                {notifStatusText}
              </span>
            </div>
          }
        />

        {/* یادآوری اقساط — روبیکا */}
        <Row
          onClick={() => setGuideOpen(true)}
          label="یادآوری سررسید اقساط"
          iconBg="bg-sky-50"
          icon={<Bell size={18} className="text-sky-600" />}
          sub={
            <>
              <div className="text-[11px] text-[#8A8273] mt-0.5">فعال‌سازی در ربات روبیکا</div>
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={11} className="text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-600">نیاز به حساب روبیکا دارد</span>
              </div>
            </>
          }
        />

        {/* خروج */}
        <div className="mt-2">
          <Row
            onClick={handleLogout}
            danger
            label="خروج از حساب"
            iconBg="bg-red-50"
            icon={<LogOut size={18} className="text-red-600" />}
          />
        </div>
      </main>

      <RubikaGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} onGoToBot={openRubikaBot} />

      {/* پیام */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-[90%] px-4 py-3 rounded-xl text-xs font-semibold leading-5 shadow-lg ${
            toast.variant === "danger" ? "bg-red-600 text-white" : "bg-[#0F6F5C] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
/* ───────── صفحه ───────── */
export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0F6F5C] border-t-transparent rounded-full" />
      </div>
    );
  }
  return (
    <CurrencyProvider initialCurrency={user?.currency ?? "IRT"}>
      <SettingsContent user={user} />
    </CurrencyProvider>
  );
}
