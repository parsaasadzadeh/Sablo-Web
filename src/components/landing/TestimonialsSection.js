export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mb-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-3">نظر کاربرانی که زندگی مالی‌شان را نجات دادند</h2>
        <p className="text-xs text-[#8A8273]">آنچه مشتریان ما در مورد سابلو می‌گویند:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FCFBF8] p-6 rounded-2xl border border-[#EDE8DC]">
          <div className="flex items-center gap-1 text-amber-500 mb-3 text-xs">⭐⭐⭐⭐⭐</div>
          <p className="text-xs text-[#26241F] leading-6 mb-4">
            «من همیشه سر قسط‌ها و وامی که داشتم گیج می‌شدم. برنامه‌های دیگه فکر می‌کردن وام درآمدِ منه و آخر ماه موجودیم منفی می‌شد. سابلو واقعاً به دادم رسید و فهمیدم چقدر بدهی دارم.»
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">س</div>
            <div>
              <h5 className="text-[11px] font-bold">سامان راد</h5>
              <span className="text-[9px] text-[#8A8273]">برنامه‌نویس</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FCFBF8] p-6 rounded-2xl border border-[#EDE8DC]">
          <div className="flex items-center gap-1 text-amber-500 mb-3 text-xs">⭐⭐⭐⭐⭐</div>
          <p className="text-xs text-[#26241F] leading-6 mb-4">
            «قبلاً پول‌هام یهویی غیب می‌شدن! الان دلیل هر پولی رو ثبت می‌کنم و داشبورد سابلو مثل یه مشاور مالی بالای سرِ منه. به همه پیشنهاد می‌کنم برای یک بار هم که شده ازش استفاده کنن.»
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">ن</div>
            <div>
              <h5 className="text-[11px] font-bold">نازنین مهدوی</h5>
              <span className="text-[9px] text-[#8A8273]">طراح UI/UX</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}