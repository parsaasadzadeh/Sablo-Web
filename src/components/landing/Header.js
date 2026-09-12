"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "چرا ما؟" },
    { href: "#stats", label: "آمارها" },
    { href: "#testimonials", label: "نظرات کاربران" },
    { href: "/contact", label: "تماس با ما" },
    { href: "/about", label: "درباره ما" },
  ];

  return (
    <header
      dir="rtl"
      className="border-b border-[#E8F0EC] bg-white/80 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* لوگو — سمت راست */}
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 3C8 3 3 8 3 14s5 11 11 11 11-5 11-11S20 3 14 3z"
              fill="#1B7A5A"
              opacity="0.15"
            />
            <path
              d="M10 18c0-4 2.5-7 6-8M14 8c2.5 1.5 4 4.5 4 8"
              stroke="#1B7A5A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="14" cy="14" r="2.5" fill="#1B7A5A" />
          </svg>
          <span className="font-extrabold text-xl text-[#1B7A5A] tracking-tight">
            ساپلو
          </span>
        </div>

        {/* ناوبری — وسط */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7570]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#1B3A2A] transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* دکمه ورود — سمت چپ */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#155F46] text-white text-sm font-bold px-6 py-2.5 rounded-2xl transition-all shadow-md shadow-[#1B7A5A]/20"
          >
            <ArrowLeft size={16} />
            ورود به اپلیکیشن
          </Link>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="باز و بسته کردن منو"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0F7F4] text-[#1B7A5A] hover:bg-[#1B7A5A]/10 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 pb-4 pt-1 text-sm font-medium text-[#6B7570] border-t border-[#E8F0EC]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 px-2 rounded-lg hover:bg-[#F0F7F4] hover:text-[#1B3A2A] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="sm:hidden mt-2 flex items-center justify-center gap-2 bg-[#1B7A5A] hover:bg-[#155F46] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            ورود به اپلیکیشن
          </Link>
        </nav>
      </div>
    </header>
  );
}
