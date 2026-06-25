import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-[#EDE8DC] bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-lg text-[#0F6F5C]">سابلو</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#8A8273]">
          <a href="#features" className="hover:text-[#26241F]">چرا ما؟</a>
          <a href="#stats" className="hover:text-[#26241F]">آمارها</a>
          <a href="#testimonials" className="hover:text-[#26241F]">نظرات کاربران</a>
        </nav>
        <Link href="/dashboard" className="flex items-center gap-2 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm">
          ورود به اپلیکیشن <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}