import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';

function MyketIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V18.5C20 19.33 19.33 20 18.5 20H5.5C4.67 20 4 19.33 4 18.5V5.5Z"
        fill="#00B0FF"
      />
      <path
        d="M8 8L12 12L8 16M13 16H16"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BazaarIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 9.5L6.4 5H17.6L19 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5H20V18.5C20 19.33 19.33 20 18.5 20H5.5C4.67 20 4 19.33 4 18.5V9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 13V16M12 13V16M16 13V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CtaSection() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-white sm:px-10 lg:px-16"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          مدیریت مالی، ساده‌تر از همیشه
        </span>

        <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          کنترل مالی شما،
          <span className="mt-2 block text-blue-400">
            از همین امروز شروع می‌شود
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          دیگر پول‌هایتان را کورکورانه خرج نکنید. با سابلو، آینده مالی خود را
          به دست بگیرید و با آرامش خاطر دخل و خرجتان را مدیریت کنید.
        </p>

        {/* Dashboard CTA */}
        <div className="mt-9">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-400"
          >
            ورود رایگان به داشبورد مالی
            <ArrowRight
              size={19}
              className="transition-transform group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* App download boxes */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {/* APK */}
          <a
            href="/downloads/sablo.apk"
            download
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-right transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.09]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Download size={23} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                دانلود مستقیم
              </div>
              <div className="mt-1 font-bold">
                فایل APK
              </div>
            </div>
          </a>

          {/* Myket */}
          <a
            href="https://myket.ir/app/com.sabloapp.sablo"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-right transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.09]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <MyketIcon size={25} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                دریافت از
              </div>
              <div className="mt-1 font-bold">
                مایکت
              </div>
            </div>
          </a>

          {/* Bazaar */}
          <a
            href="https://cafebazaar.ir/app/com.sabloapp.sablo"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-right transition hover:-translate-y-1 hover:border-green-400/30 hover:bg-white/[0.09]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
              <BazaarIcon size={24} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                دریافت از
              </div>
              <div className="mt-1 font-bold">
                کافه‌بازار
              </div>
            </div>
          </a>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          سابلو را از روش مورد علاقه‌تان نصب کنید و مدیریت مالی را شروع کنید.
        </p>
      </div>
    </section>
  );
}
