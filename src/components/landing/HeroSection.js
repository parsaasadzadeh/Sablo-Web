"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

/* ── Bazaar Logo (Cafe Bazaar – green shopping bag) ── */
function BazaarIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="بازار"
    >
      {/* bag body */}
      <rect x="8" y="22" width="48" height="36" rx="6" fill="white" fillOpacity="0.2" />
      <rect x="8" y="22" width="48" height="36" rx="6" stroke="white" strokeWidth="3.5" />
      {/* handle */}
      <path
        d="M22 22C22 14.268 26.477 8 32 8C37.523 8 42 14.268 42 22"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* sparkle / star */}
      <path
        d="M32 33 L33.5 37 L38 37 L34.5 39.5 L36 44 L32 41.5 L28 44 L29.5 39.5 L26 37 L30.5 37 Z"
        fill="white"
      />
    </svg>
  );
}

/* ── Myket Logo (M lettermark in blue/white) ── */
function MyketIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="مایکت"
    >
      <circle cx="32" cy="32" r="28" fill="white" fillOpacity="0.2" />
      <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" />
      {/* Bold M */}
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="32"
        fill="white"
        letterSpacing="-1"
      >
        M
      </text>
    </svg>
  );
}

export default function HeroSection() {
  const { isLoggedIn } = useAuth();

  return (
    <section dir="rtl" className="relative overflow-hidden">

      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center">

        {/* ── Text block ── */}
        <div className="flex-1 flex flex-col items-start text-right z-10 order-2 md:order-1 px-6 py-14 md:py-20">

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white border border-[#C6E8DC] text-[#0F6F5C] text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 shadow-sm">
            🌿 مدیریت مالی ساده‌تر، زندگی بهتر
          </span>

          {/* Headline */}
          <h1 className="text-3xl md:text-[2.6rem] lg:text-5xl font-extrabold text-[#1A1916] leading-[1.35] mb-5">
            آیا می‌دانید پول‌هایتان
            <br />
            دقیقاً کجا خرج می‌شوند؟
          </h1>

          {/* Sub */}
          <p className="text-sm md:text-base text-[#6B6860] leading-8 mb-8 max-w-md">
            با سابلو، دخل، خرج، و بدهی‌هایتان را به سادگی مدیریت کنید.
            از خریدهای روزمره تا اقساط و پس‌انداز، همه چیز در یک اپلیکیشن.
          </p>

          {/* ── CTAs ── */}
          {/* Desktop: row  |  Mobile: 2×2 grid + login full-width */}
          <div className="w-full sm:w-auto">

            {/* Download buttons — 2 col on mobile, row on sm+ */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 mb-3 sm:mb-0">

              {/* Bazaar */}
              <a
                href="#"
                className="
                  flex items-center justify-center gap-2.5
                  bg-[#2B9348] hover:bg-[#247A3C]
                  text-white font-bold
                  px-4 py-3 rounded-xl transition-all shadow-sm
                  text-xs sm:text-sm sm:min-w-[156px]
                "
              >
                <BazaarIcon size={22} />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-80">دانلود از</span>
                  <span className="text-sm sm:text-base font-extrabold">بازار</span>
                </span>
              </a>

              {/* Myket */}
              <a
                href="#"
                className="
                  flex items-center justify-center gap-2.5
                  bg-[#1565D8] hover:bg-[#1255BB]
                  text-white font-bold
                  px-4 py-3 rounded-xl transition-all shadow-sm
                  text-xs sm:text-sm sm:min-w-[156px]
                "
              >
                <MyketIcon size={22} />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-80">دانلود از</span>
                  <span className="text-sm sm:text-base font-extrabold">مایکت</span>
                </span>
              </a>

              {/* Login — hidden on mobile (shown below), visible on sm+ */}
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="
                  hidden sm:flex items-center justify-center gap-2
                  bg-[#0F6F5C] hover:bg-[#0C5A4A]
                  text-white text-sm font-bold
                  px-6 py-3 rounded-xl transition-all shadow-sm
                  min-w-[120px]
                "
              >
                <span className="text-base">👤</span>
                {isLoggedIn ? "داشبورد" : "ورود"}
              </Link>
            </div>

            {/* Login — full width on mobile only */}
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="
                sm:hidden mt-3 flex items-center justify-center gap-2
                bg-[#0F6F5C] hover:bg-[#0C5A4A]
                text-white text-sm font-bold
                w-full py-3 rounded-xl transition-all shadow-sm
              "
            >
              <span className="text-base">👤</span>
              {isLoggedIn ? "ورود به داشبورد" : "ورود به اپلیکیشن"}
            </Link>
          </div>
        </div>

        {/* ── Image block ── */}
        <div className="flex-1 flex justify-center md:justify-end items-end relative order-1 md:order-2 z-10 pt-10 md:pt-0">
          {/* Green circle backdrop */}
          <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bottom-0 w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full bg-[#0F6F5C]/10" />

          <div className="relative w-[280px] md:w-[380px] lg:w-[430px] drop-shadow-xl">
            <Image
              src="/hero-masct.png"
              alt="کاراکتر سابلو"
              width={430}
              height={520}
              priority
              className="object-contain"
            />
          </div>

          {/* Floating balance card */}
          <div className="hidden lg:flex absolute left-4 bottom-16 bg-white rounded-2xl shadow-lg px-4 py-3 flex-col gap-1 text-right border border-[#EDE8DC]">
            <span className="text-[10px] text-[#8A8273] font-medium">موجودی کل</span>
            <span className="text-base font-extrabold text-[#1A1916]">۱۲٫۴۷۵٬۰۰۰ تومان</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[10px] text-emerald-600 font-medium">این ماه مثبته!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom install strip ── */}
      <div className="border-t border-[#EDE8DC]">
        <div
          dir="rtl"
          className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5F1] flex items-center justify-center shrink-0">
              <span className="text-lg">📥</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#1A1916]">آموزش نصب اپلیکیشن</p>
              <p className="text-[11px] text-[#8A8273]">
                برای دانلود و نصب اپلیکیشن سابلو، راهنمای مربوط به دستگاه خود را ببینید
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <a
              href="#"
              className="flex items-center gap-2 text-xs font-semibold text-[#26241F] hover:text-[#0F6F5C] transition-colors"
            >
              <span>🍎</span> آموزش نصب برای آیفون
              <span className="text-[#0F6F5C]">›</span>
            </a>
            <div className="w-px h-4 bg-[#EDE8DC]" />
            <a
              href="#"
              className="flex items-center gap-2 text-xs font-semibold text-[#26241F] hover:text-[#0F6F5C] transition-colors"
            >
              <span>🪟</span> آموزش نصب برای ویندوز
              <span className="text-[#0F6F5C]">›</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
