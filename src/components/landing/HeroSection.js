import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center max-w-3xl mx-auto mb-20">
      <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full mb-4">
        نسخه هوشمند و ارتقا یافته سال ۱۴۰۵
      </span>
      <h1 className="text-3xl md:text-5xl font-extrabold text-[#26241F] leading-snug md:leading-tight mb-6">
        آیا می‌دانید پول‌هایتان دقیقاً <span className="text-[#0F6F5C]">کجا</span> خرج می‌شوند؟
      </h1>
      <p className="text-sm md:text-base text-[#8A8273] leading-7 mb-8 max-w-2xl mx-auto">
        بیشتر آدم‌ها دخل و خرجشان را گم می‌کنند، چون سیستم‌های سنتی نمی‌فهمند فرقِ «وام» با «خرج روزمره» چیست! با سابلو، دخل، خرج، اقساط و بدهی‌هایت را به سادگیِ یک آب خوردن مدیریت کن و هیچ‌وقت گیج نشو.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/login" className="w-full sm:w-auto h-12 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-xs font-bold px-8 rounded-xl transition-all shadow flex items-center justify-center gap-2">
        ورود  <ArrowRight size={16} />
        </Link>
        <a href="#features" className="w-full sm:w-auto h-12 bg-white border border-[#EDE8DC] hover:bg-gray-50 text-xs font-semibold px-8 rounded-xl transition-all flex items-center justify-center">
          بیشتر بدانید
        </a>
      </div>
    </section>
  );
}