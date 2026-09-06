"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Loader2, Landmark } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import LoanCard from "@/components/loans/LoanCard";
import CreateLoanModal from "@/components/loans/CreateLoanModal";

export default function LoansContent() {
  const router  = useRouter();
  const { display, unit } = useCurrency();

  const [loans,          setLoans]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [isModalOpen,    setIsModalOpen]    = useState(false);

  const fetchLoans = useCallback(async () => {
    try {
      const res = await api.get("/finance/loans");
      setLoans(res.data.loans ?? []);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handlePay = async (installmentId) => {
    try {
      await api.put(`/finance/pay-installment/${installmentId}`, {});
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "خطا در پرداخت قسط");
    }
  };

  const handleDelete = async (loan) => {
    if (!window.confirm(`آیا مطمئنید می‌خواهید وام «${loan.title}» را حذف کنید؟\nتمام اقساط مرتبط هم حذف خواهند شد.`)) return;
    try {
      await api.delete(`/finance/delete/${loan._id}`);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "خطا در حذف وام");
    }
  };

  // خلاصه کلی
  const totalDebt      = loans.reduce((s, l) => s + l.remainingAmount, 0);
  const totalPaid      = loans.reduce((s, l) => s + l.paidAmount, 0);
  const activeLoans    = loans.filter(l => !l.isFullyPaid).length;

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: #FCFBF8 !important; border-color: #E5E1D6 !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: #0F6F5C !important; }
      `}</style>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">

        {/* هدر */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#0F6F5C] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#0a5c4a] transition-colors"
          >
            <Plus size={14} /> وام جدید
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#26241F]">وام‌های من</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-sm text-[#8A8273] hover:text-[#26241F] transition-colors"
            >
              <ArrowRight size={15} /> بازگشت
            </button>
          </div>
        </div>

        {/* خلاصه کلی — فقط وقتی وام داریم */}
        {!loading && loans.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EDE8DC] p-4 mb-5">
            <div className="flex flex-row-reverse gap-3">
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[#8A8273] mb-1">بدهی باقیمانده</p>
                <p className="text-sm font-extrabold text-rose-500">
                  {display(totalDebt)} {unit}
                </p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[#8A8273] mb-1">پرداخت شده</p>
                <p className="text-sm font-extrabold text-emerald-600">
                  {display(totalPaid)} {unit}
                </p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[#8A8273] mb-1">وام فعال</p>
                <p className="text-sm font-extrabold text-[#0F6F5C]">
                  {activeLoans} وام
                </p>
              </div>
            </div>
          </div>
        )}

        {/* محتوا */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0F6F5C]" size={28} />
          </div>
        ) : loans.length === 0 ? (
          /* حالت خالی */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-[#EDE8DC] rounded-full flex items-center justify-center">
              <Landmark size={28} className="text-[#8A8273]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#26241F] mb-1">هنوز وامی ثبت نشده</p>
              <p className="text-xs text-[#8A8273]">
                وام‌های بانکی رو اینجا ثبت کن تا اقساطشون خودکار مدیریت بشه
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0F6F5C] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#0a5c4a] transition-colors"
            >
              ثبت اولین وام
            </button>
          </div>
        ) : (
          /* لیست وام‌ها */
          <>
            {/* وام‌های فعال اول */}
            {loans.filter(l => !l.isFullyPaid).map(loan => (
              <LoanCard
                key={loan._id}
                loan={loan}
                display={display}
                unit={unit}
                onPay={handlePay}
                onDelete={handleDelete}
              />
            ))}

            {/* وام‌های تسویه‌شده */}
            {loans.filter(l => l.isFullyPaid).length > 0 && (
              <>
                <p className="text-xs font-bold text-[#8A8273] text-right mb-3 mt-2">
                  تسویه‌شده‌ها
                </p>
                {loans.filter(l => l.isFullyPaid).map(loan => (
                  <LoanCard
                    key={loan._id}
                    loan={loan}
                    display={display}
                    unit={unit}
                    onPay={handlePay}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <CreateLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => { setLoading(true); fetchLoans(); }}
      />
    </div>
  );
}
