"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "چرا ما؟" },
    { href: "#stats", label: "آمارها" },
    { href: "#testimonials", label: "نظرات کاربران" },
    { href: "/contact", label: "تماس با ما" },
  ];

  return (
    <header className="border-b border-[#EDE8DC] bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl"></span>
          <span className="font-bold text-lg text-[#0F6F5C]">سابلو</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#8A8273]">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-[#26241F]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            ورود به اپلیکیشن <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="باز و بسته کردن منو"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7F4EE] text-[#0F6F5C] hover:bg-[#0F6F5C]/10 transition-colors"
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
        <nav className="flex flex-col gap-1 px-6 pb-4 pt-1 text-sm font-medium text-[#8A8273] border-t border-[#EDE8DC]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 px-2 rounded-lg hover:bg-[#F7F4EE] hover:text-[#26241F] transition-colors"
            >
              {item.label}
            </a>
          ))}

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="sm:hidden mt-2 flex items-center justify-center gap-2 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-sm"
          >
            ورود به اپلیکیشن <ArrowRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
