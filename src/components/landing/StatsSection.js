import { AlertTriangle, Wallet, TrendingUp } from 'lucide-react';

export default function StatsSection() {
  return (
    <section id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      <div className="bg-white p-6 rounded-2xl border border-[#EDE8DC] text-center shadow-sm">
        <div className="w-12 h-12 mx-auto bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-rose-700 tabular mb-2">۸۷٪</h3>
        <span className="text-xs font-semibold block text-[#26241F] mb-2">ناتوانی در پس‌انداز</span>
        <p className="text-[11px] text-[#8A8273] leading-5">
          افرادی که دخل و خرج خود را نمی‌نویسند، ماهانه حداقل ۳۰٪ از درآمد خود را بدون اینکه متوجه شوند، هدر می‌دهند.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#EDE8DC] text-center shadow-sm">
        <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
          <Wallet size={24} />
        </div>
        <h3 className="text-xl font-bold text-amber-700 tabular mb-2">تراز منفی</h3>
        <span className="text-xs font-semibold block text-[#26241F] mb-2">سردرگمی وام و قسط</span>
        <p className="text-[11px] text-[#8A8273] leading-5">
          در برنامه‌های معمولی، وقتی وام می‌گیری چون پول وارد حسابت شده سیستم فکر می‌کند درآمد داری و بعد از خرج شدنش گیج می‌شوی!
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#EDE8DC] text-center shadow-sm">
        <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp size={24} />
        </div>
        <h3 className="text-xl font-bold text-emerald-700 tabular mb-2">+۴۰٪</h3>
        <span className="text-xs font-semibold block text-[#26241F] mb-2">رشد مالی با سیستم هوشمند</span>
        <p className="text-[11px] text-[#8A8273] leading-5">
          کاربران ما پس از ۳۰ روز استفاده از سیستم حسابداری دقیق، توانسته‌اند هزینه‌های اضافی خود را تا چهل درصد کنترل کنند.
        </p>
      </div>
    </section>
  );
}