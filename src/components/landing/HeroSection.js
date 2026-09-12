import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Play, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[#F4FAF7] min-h-[calc(100vh-80px)]"
    >
      {/* پس‌زمینه دکوراتیو */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        {/* دایره سبز بزرگ — گوشه راست بالا */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C8EAD8]/50" />
        {/* دایره کوچک — گوشه چپ پایین */}
        <div className="absolute bottom-32 -left-16 w-48 h-48 rounded-full bg-[#C8EAD8]/40" />
        {/* شکل برگ — گوشه راست پایین */}
        <svg
          className="absolute bottom-0 right-0 w-64 opacity-20"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M180 20C120 20 20 60 20 160c60 0 160-60 160-140z"
            fill="#1B7A5A"
          />
        </svg>
      </div>

      <div className="relative w-full px-8 xl:px-20 pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* ستون متن — راست */}
          <div className="flex flex-col items-start text-right">
            {/* بج */}
            <span className="inline-flex items-center gap-1.5 bg-white border border-[#C8EAD8] text-[#1B7A5A] text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <TrendingUp size={13} />
              نسخه هوشمند و ارتقا یافته سال ۱۴۰۵
            </span>

            {/* تیتر اصلی */}
            <h1 className="text-4xl md:text-5xl xl:text-[56px] font-extrabold text-[#1B2E26] leading-[1.3] mb-5">
              آیا می‌دانید پوهایتان دقیقا
              <br />
              <span className="text-[#1B7A5A]">کجا خرج</span> می‌شوند؟
            </h1>

            {/* توضیح */}
            <p className="text-sm md:text-base text-[#6B7A72] leading-8 mb-8 max-w-md">
              بیشتر آدم‌ها دخل و خرجشان را گم می‌کنند، چون نمی‌فهمند فرق «وام» با «خرج روزمره» چیست! با ساپلو، دخل، خرج، اقساط و بدهی‌هایت را به سادگی یکجا مدیریت کن و هیچوقت گیج نشو.
            </p>

            {/* دکمه‌ها */}
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#155F46] text-white text-sm font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#1B7A5A]/25"
              >
                <ArrowLeft size={16} />
                ورود به اپلیکیشن
              </Link>
              <a
                href="#features"
                className="flex items-center gap-3 bg-white border border-[#D8E8E0] hover:bg-[#F0F7F4] text-[#1B3A2A] text-sm font-semibold px-8 py-3.5 rounded-2xl transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-[#F0F7F4] border border-[#D8E8E0] flex items-center justify-center">
                  <Play size={11} fill="#1B7A5A" className="text-[#1B7A5A] mr-0.5" />
                </span>
                بیشتر بدانید
              </a>
            </div>
          </div>

          {/* ستون تصویر — چپ */}
          <div className="relative flex items-end justify-center lg:justify-end">
            {/* کارت چارت بالای تصویر */}
            <div className="absolute top-4 right-4 lg:-right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-10">
              <div className="flex items-end gap-0.5 h-10">
                {[3, 5, 4, 7, 6, 9, 8].map((h, i) => (
                  <div
                    key={i}
                    className="w-2.5 rounded-t-sm"
                    style={{
                      height: `${h * 4}px`,
                      backgroundColor: i === 5 || i === 6 ? "#1B7A5A" : "#C8EAD8",
                    }}
                  />
                ))}
              </div>
              <svg
                className="w-5 h-5 text-[#1B7A5A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(45 12 12)" />
              </svg>
            </div>

            {/* کارت هشدار — سمت چپ تصویر */}
            <div className="absolute left-0 top-1/3 bg-white rounded-2xl shadow-xl px-4 py-3 z-10 flex flex-col gap-2 w-36">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-[#F59E0B]" />
                <div className="h-2 bg-[#F0F0F0] rounded flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                  <span className="text-[#F59E0B] text-[8px]">$</span>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-[#EF4444]" />
                <div className="h-2 bg-[#F0F0F0] rounded flex-1" />
              </div>
            </div>

            {/* تصویر اصلی — جایگذار؛ src رو با عکس خودت عوض کن */}
            <div className="relative w-[340px] md:w-[420px] h-[380px] md:h-[460px]">
              {/*
                وقتی عکس داری، این div رو با:
                <Image src="/your-hero-image.png" alt="ساپلو" fill className="object-contain object-bottom" />
                جایگزین کن
              */}
              <div className="w-full h-full bg-gradient-to-b from-[#C8EAD8]/30 to-[#C8EAD8]/10 rounded-3xl flex items-end justify-center overflow-hidden">
                <div className="text-center pb-8 text-[#1B7A5A]/40 text-sm">
                  تصویر اصلی اینجا قرار می‌گیرد
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
