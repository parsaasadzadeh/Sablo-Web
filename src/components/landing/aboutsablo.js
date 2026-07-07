"use client"
import { useState, useRef, useId } from "react";
import {
  ChevronDown,
  Sparkles,
  Wallet,
  PieChart,
  BellRing,
  Smartphone,
  Repeat,
  Heart,
} from "lucide-react";

/**
 * Font: Vazirmatn — a contemporary, highly legible Persian typeface with a
 * real weight range, used here in two roles: Black/ExtraBold for the display
 * heading and paragraph markers, Regular for body copy.
 */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
    .sablo-font { font-family: 'Vazirmatn', ui-sans-serif, system-ui, sans-serif; }

    @keyframes sablo-draw {
      to { stroke-dashoffset: 0; }
    }
    .sablo-line {
      stroke-dasharray: 900;
      stroke-dashoffset: 900;
      animation: sablo-draw 2.2s ease-out forwards;
    }
    @media (prefers-reduced-motion: reduce) {
      .sablo-line { animation: none; stroke-dashoffset: 0; }
    }
  `}</style>
);

const SECTIONS = [
  {
    icon: Wallet,
    label: "شفافیت واقعی",
    text: "سابلو یک اپلیکیشن مدیریت مالی شخصی است که به کاربران کمک می‌کند بدون نیاز به دانش حسابداری، تمام درآمدها، هزینه‌ها، بدهی‌ها و اقساط خود را در یک بستر ساده و قابل‌فهم مدیریت کنند. بسیاری از افراد در طول ماه بدون داشتن یک برنامه مدیریت مالی شخصی مشخص، متوجه نمی‌شوند که پول آن‌ها دقیقاً کجا خرج شده است و همین موضوع باعث می‌شود در پایان هر ماه با کمبود بودجه یا سردرگمی مالی روبه‌رو شوند. سابلو با ارائه یک اپلیکیشن حسابداری شخصی کاربرپسند، این مشکل را حل کرده و امکان ثبت سریع تراکنش‌ها، دسته‌بندی هوشمند هزینه‌ها و مشاهده گزارش‌های تصویری از وضعیت مالی را در اختیار کاربر قرار می‌دهد. یکی از تفاوت‌های اصلی سابلو نسبت به سایر برنامه‌های بودجه بندی این است که وام و بدهی دریافتی را به‌عنوان درآمد واقعی در نظر نمی‌گیرد، بلکه آن را به‌طور جداگانه در بخش بدهی‌ها ثبت می‌کند تا تراز مالی نمایش داده‌شده به کاربر همیشه دقیق و واقع‌بینانه باشد. این ویژگی به‌خصوص برای افرادی که وام بانکی یا اقساط شخصی دارند بسیار کاربردی است، چرا که بسیاری از اپلیکیشن‌های حسابداری سنتی این تفکیک را انجام نمی‌دهند و همین موضوع باعث می‌شود کاربر تصویر نادرستی از وضعیت مالی خود داشته باشد.",
  },
  {
    icon: PieChart,
    label: "بودجه‌بندی هوشمند",
    text: "مدیریت مالی شخصی تنها به معنای ثبت اعداد نیست، بلکه به معنای درک درست از الگوی مصرف و هزینه‌کرد است. سابلو با استفاده از تحلیل هوشمند تراکنش‌ها، به کاربر نشان می‌دهد که در کدام دسته از هزینه‌ها (مانند خوراک، حمل‌ونقل، قبوض، تفریح، پوشاک یا خرید‌های غیرضروری) بیشترین مبلغ را خرج کرده و آیا این روند با اهداف مالی بلندمدت او همخوانی دارد یا خیر. ابزار بودجه بندی داخل اپلیکیشن به کاربران این امکان را می‌دهد که برای هر دسته از هزینه‌ها یک سقف مشخص تعیین کنند و در طول ماه به‌صورت لحظه‌ای پیشرفت خود نسبت به آن سقف را مشاهده کنند. این قابلیت به‌ویژه برای خانواده‌هایی که به‌دنبال کنترل هزینه‌های ماهانه منزل هستند و همچنین برای دانشجویان و افراد جوانی که برای اولین‌بار می‌خواهند عادت مدیریت مالی شخصی را در زندگی خود نهادینه کنند، بسیار مفید است.",
  },
  {
    icon: BellRing,
    label: "هشدار پیش از بحران",
    text: "یکی دیگر از ویژگی‌های کلیدی سابلو، سیستم هشدار هوشمند مالی است. زمانی که الگوریتم داخلی اپلیکیشن تشخیص دهد که تراز حساب کاربر رو به منفی‌شدن است یا روند هزینه‌کرد او از میانگین معمول بیشتر شده، به کاربر هشدار می‌دهد و راهکارهای عملی برای اصلاح وضعیت پیشنهاد می‌کند. این ویژگی باعث می‌شود کاربر پیش از رسیدن به بحران مالی، تصمیم درستی بگیرد و بتواند مسیر هزینه‌کرد خود را اصلاح کند. علاوه بر این، سابلو به‌عنوان یک اپلیکیشن حسابداری شخصی کامل، امکان پیگیری اقساط بانکی و بدهی‌های شخصی (مثل قرض گرفتن از دوستان و آشنایان) را نیز فراهم کرده است. کاربران می‌توانند سررسید هر قسط یا بدهی را ثبت کنند و پیش از فرارسیدن تاریخ سررسید، یادآوری دریافت کنند تا هیچ‌گاه دچار جریمه دیرکرد یا فراموشی پرداخت نشوند.",
  },
  {
    icon: Smartphone,
    label: "سادگی برای همه",
    text: "طراحی رابط کاربری سابلو بر پایه سادگی و مینیمال‌گرایی بنا شده است. برخلاف بسیاری از نرم‌افزارهای حسابداری حرفه‌ای که برای استفاده از آن‌ها نیاز به آموزش و دانش تخصصی است، سابلو با چیدمان ساده و شهودی خود، امکان استفاده آسان را برای همه گروه‌های سنی و شغلی فراهم می‌کند. این اپلیکیشن مدیریت مالی شخصی برای طیف گسترده‌ای از کاربران طراحی شده است؛ از دانشجویانی که می‌خواهند برای اولین‌بار مدیریت هزینه‌های شخصی خود را یاد بگیرند، تا فریلنسرها و صاحبان کسب‌وکارهای کوچک که با درآمد متغیر سروکار دارند و نیاز به ابزاری منعطف برای مدیریت مالی شخصی و ثبت درآمدهای نامنظم خود دارند. همچنین خانواده‌هایی که به‌دنبال یک برنامه بودجه بندی مشترک برای مدیریت هزینه‌های خانه هستند نیز می‌توانند از این اپلیکیشن به‌عنوان یک ابزار ساده و دقیق برای کنترل هزینه‌ها استفاده کنند.",
  },
  {
    icon: Repeat,
    label: "جایگزین دفترچه و اکسل",
    text: "در مقایسه با روش‌های سنتی مدیریت مالی شخصی، مانند نوشتن هزینه‌ها در دفترچه کاغذی یا استفاده از فایل‌های اکسل پراکنده، سابلو مزیت‌های قابل‌توجهی ارائه می‌دهد. در روش‌های سنتی، ثبت اطلاعات زمان‌بر است، امکان دسته‌بندی خودکار وجود ندارد، یادآوری اقساط و بدهی‌ها به‌صورت دستی و غیرقابل‌اعتماد انجام می‌شود و هیچ نوع گزارش تصویری یا تحلیل هوشمندی از داده‌ها در دسترس نیست. اما با استفاده از سابلو، تمام این فرآیندها به‌صورت خودکار و در کسری از ثانیه انجام می‌شود و کاربر در هر لحظه از طریق گوشی هوشمند خود به وضعیت کامل مالی‌اش دسترسی دارد. این موضوع باعث می‌شود سابلو نه‌تنها یک اپلیکیشن ثبت هزینه ساده، بلکه یک دستیار هوشمند برای مدیریت مالی شخصی و برنامه‌ریزی بلندمدت مالی باشد.",
  },
  {
    icon: Heart,
    label: "مقصد نهایی: آرامش مالی",
    text: "هدف اصلی سابلو کمک به کاربران برای رسیدن به آرامش مالی است. آرامش مالی زمانی به‌دست می‌آید که فرد بداند دقیقاً چقدر درآمد دارد، چقدر هزینه می‌کند، چه میزان بدهی و قسط باید پرداخت کند و چقدر می‌تواند پس‌انداز کند. بدون یک اپلیکیشن مدیریت مالی شخصی مناسب، رسیدن به این سطح از شفافیت مالی بسیار دشوار است. سابلو با ترکیب سادگی در طراحی، دقت در محاسبات و هوشمندی در تحلیل داده‌ها، تلاش می‌کند این هدف را برای هر کاربری، فارغ از سطح دانش مالی او، در دسترس قرار دهد. اگر به‌دنبال بهترین اپلیکیشن حسابداری شخصی برای کنترل کامل بودجه ماهانه، مدیریت بدهی و اقساط، و دریافت هشدارهای هوشمند مالی هستید، سابلو گزینه‌ای است که می‌تواند این نیازها را به‌طور کامل پوشش دهد.",
  },
];

export default function AboutSablo() {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const gradId = useId();

  return (
    <section dir="rtl" className="sablo-font relative py-20 px-4 sm:px-6 overflow-hidden">
      <FontImport />

      {/* ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.07) 0%, rgba(16,185,129,0) 70%)",
        }}
      />

      <div className="max-w-3xl mx-auto">
        {/* eyebrow badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold tracking-wide text-emerald-700">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            درباره سابلو
          </span>
        </div>

        <h2 className="text-[26px] sm:text-4xl font-black text-center text-gray-900 mb-3 leading-[1.5] sm:leading-[1.45]">
          از سردرگمی مالی تا{" "}
          <span className="relative inline-block text-emerald-600">
            آرامش مالی
            <svg
              aria-hidden
              viewBox="0 0 200 12"
              className="absolute -bottom-1 left-0 w-full h-2.5"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9 Q 50 2, 100 6 T 198 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-emerald-300"
              />
            </svg>
          </span>
        </h2>

        <p className="text-center text-gray-500 text-sm sm:text-base mb-10 max-w-xl mx-auto leading-7">
          سابلو دقیقاً چطور به مدیریت مالی شما کمک می‌کند؟ شش گام، از ثبت اولین
          تراکنش تا رسیدن به شفافیت کامل.
        </p>

        <div className="relative rounded-[28px] border border-gray-100 bg-white shadow-[0_2px_40px_-12px_rgba(16,24,40,0.12)] p-6 sm:p-10">
          {/* signature: a line that calms from jagged to smooth, echoing the
              "from financial chaos to clarity" narrative */}
          <svg
            aria-hidden
            viewBox="0 0 600 60"
            className="absolute top-0 right-0 w-2/3 sm:w-1/2 h-14 opacity-[0.35] pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9CA3AF" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <path
              d="M0 40 L20 15 L40 45 L60 10 L80 38 L100 20 L130 34 Q 220 44, 300 30 T 460 24 Q 520 22, 600 20"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="sablo-line"
            />
          </svg>

          <div
            ref={contentRef}
            className={`relative overflow-hidden transition-[max-height] duration-500 ease-in-out ${
              expanded ? "max-h-[5000px]" : "max-h-[220px] sm:max-h-[190px]"
            }`}
          >
            <ol className="space-y-7">
              {SECTIONS.map(({ icon: Icon, label, text }, i) => (
                <li key={i} className="flex gap-4 sm:gap-5">
                  {/* progress marker: fades from neutral to emerald across
                      the six stages, tracing the "toward calm" arc */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: `rgba(5,150,105,${0.15 + i * 0.15})`,
                        backgroundColor: `rgba(5,150,105,${0.05 + i * 0.03})`,
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        strokeWidth={2.2}
                        style={{ color: `rgba(5,150,105,${0.55 + i * 0.09})` }}
                      />
                    </span>
                    {i < SECTIONS.length - 1 && (
                      <span className="mt-2 w-px flex-1 bg-gradient-to-b from-emerald-200 to-transparent" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1.5 text-[13px] font-bold text-emerald-700">
                      {label}
                    </p>
                    <p className="text-[15px] sm:text-[16px] leading-8 text-gray-600 text-justify">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {!expanded && (
            <div className="pointer-events-none absolute bottom-16 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent rounded-b-[28px]" />
          )}

          <div className="relative mt-7 flex justify-center">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="sablo-about-content"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-bold px-6 py-2.5 text-sm transition-all duration-200 shadow-sm shadow-emerald-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {expanded ? "بستن متن" : "مشاهده کامل"}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
