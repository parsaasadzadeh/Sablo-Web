import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
        <Link href="/dashboard" className="h-12 bg-white text-[#0F6F5C] hover:bg-gray-100 text-xs font-bold px-8 rounded-xl transition-all shadow inline-flex items-center justify-center gap-2">
          ورود رایگان به داشبورد مالی <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}