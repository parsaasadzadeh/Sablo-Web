import { CheckCircle2 } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white rounded-3xl border border-[#EDE8DC] p-8 md:p-12 mb-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-3">چرا به سابلو نیاز دارید?</h2>
        <p className="text-xs text-[#8A8273]">امکانات هوشمندی که هیچ برنامه حسابداری سنتی‌ای ندارد.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1.5">تشخیص هوشمند وام از درآمد</h4>
            <p className="text-xs text-[#8A8273] leading-6">
              سابلو می‌داند که وام دریافتی در واقع «تعهد و بدهی» است، نه سود خالص! به شما می‌گوید چقدر از پول برای شماست و چقدر بدهی بانکی دارید.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1.5">تحلیل‌گر روانشناسی مالی</h4>
            <p className="text-xs text-[#8A8273] leading-6">
              اگر دخل و خرجت به مشکل بخورد و تراز مالی‌اش منفی شود، سابلو سکوت نمی‌کند؛ بلکه با هشدارهای دلسوزانه به تو راهکار می‌دهد.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1.5">سررسید اقساط و بدهی دوستان</h4>
            <p className="text-xs text-[#8A8273] leading-6">
              اگر از دوستی پول قرض کرده‌ای یا قسطی داری، با تعیین موعد بازپرداخت، سابلو سر موعد به تو یادآوری می‌کند که بدهی‌ات را صاف کنی.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1.5">رابط کاربری کاملاً مینیمال و ساده</h4>
            <p className="text-xs text-[#8A8273] leading-6">
              بدون هیچ‌گونه پیچیدگی یا منوهای گیج‌کننده. همه چیز در یک نگاه تمیز، مرتب و به دور از سردرگمی است.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}