"use client";
import { useState } from "react";
import { useCurrency } from "@/context/currencyContext";

export default function CurrencyToggle() {
  const { currency, changeCurrency } = useCurrency();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(null);

  const handleClick = (val) => {
    if (val === currency) return;
    setPendingCurrency(val);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingCurrency) return;
    await changeCurrency(pendingCurrency);
    setShowConfirm(false);
    setPendingCurrency(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingCurrency(null);
  };

  return (
    <>
      <div className="flex items-center justify-between bg-white border border-[#EDE8DC] rounded-2xl px-4 py-3 mb-4">
        <span className="text-sm font-semibold text-[#26241F]">واحد نمایش مبالغ</span>
        <div className="flex rounded-xl border border-[#EDE8DC] overflow-hidden">
          <button
            onClick={() => handleClick("IRT")}
            className={`px-5 py-2 text-sm font-semibold transition-colors ${
              currency === "IRT"
                ? "bg-[#0F6F5C] text-white"
                : "bg-white text-[#8A8273] hover:text-[#26241F]"
            }`}
          >
            تومان
          </button>
          <button
            onClick={() => handleClick("IRR")}
            className={`px-5 py-2 text-sm font-semibold transition-colors ${
              currency === "IRR"
                ? "bg-[#0F6F5C] text-white"
                : "bg-white text-[#8A8273] hover:text-[#26241F]"
            }`}
          >
            ریال
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#EDE8DC] shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-[#26241F] mb-2">
              تغییر واحد به {pendingCurrency === "IRT" ? "تومان" : "ریال"}
            </h3>
            <p className="text-sm text-[#8A8273] leading-6 mb-5">
              {pendingCurrency === "IRT"
                ? "مبالغ نمایش داده شده به تومان تبدیل می‌شوند."
                : "مبالغ نمایش داده شده به ریال تبدیل می‌شوند."}
              <br />
              <span className="text-amber-600 font-medium text-xs mt-1 block">
                ⚠️ هنگام ثبت تراکنش جدید، مبلغ را به{" "}
                {pendingCurrency === "IRT" ? "تومان" : "ریال"} وارد کنید.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-[#0F6F5C] text-white font-semibold rounded-xl py-2.5 text-sm"
              >
                تأیید
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl py-2.5 text-sm"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
