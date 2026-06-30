import Link from 'next/link';
import { ArrowRight, Download, PlayCircle } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="bg-[#0F6F5C] text-white rounded-3xl p-10 md:p-16 text-center shadow-lg relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-snug md:leading-tight">
          کنترل مالی شما، از همین امروز شروع می‌شود
        </h2>
        <p className="text-xs opacity-90 leading-6 mb-8 max-w-xl mx-auto">
          دیگر پول‌هایتان را کورکورانه خرج نکنید. با سابلو، آینده مالی خود را به دست بگیرید و با آرامش خاطر دخل و خرجتان را مدیریت کنید.
        </p>

        <Link
          href="/dashboard"
          className="h-12 bg-white text-[#0F6F5C] hover:bg-gray-100 text-xs font-bold px-8 rounded-xl transition-all shadow inline-flex items-center justify-center gap-2 mb-8"
        >
          ورود رایگان به داشبورد مالی <ArrowRight size={16} />
        </Link>

        {/* دکمه‌های دانلود اپلیکیشن */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* دانلود مستقیم APK */}
          <a
            href="https://rbofs27hxnaifjf5.public.blob.vercel-storage.com/Sablo.apk"
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl px-4 py-2 transition-all backdrop-blur-sm"
          >
            <Download size={22} className="shrink-0" />
            <span className="flex flex-col items-start leading-tight text-left">
              <span className="text-[10px] opacity-80">دانلود مستقیم</span>
              <span className="text-sm font-bold">فایل APK</span>
            </span>
          </a>

          {/* گوگل پلی */}
          <a
            href="#"
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl px-4 py-2 transition-all backdrop-blur-sm"
          >
            <PlayCircle size={22} className="shrink-0" />
            <span className="flex flex-col items-start leading-tight text-left">
              <span className="text-[10px] opacity-80">دریافت از</span>
              <span className="text-sm font-bold">Google Play</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
