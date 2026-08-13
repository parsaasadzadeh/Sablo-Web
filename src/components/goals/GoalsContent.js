"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Target, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import GoalCard from "@/components/reports/GoalCard";

export default function GoalsContent() {
  const router = useRouter();
  const { display, unit, currency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data.goals);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !amount || !deadline) {
      setError("همه فیلدها الزامی هستند");
      return;
    }
    const numericAmount = Number(amount.replace(/,/g, ""));
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;
    setFormLoading(true);
    try {
      await api.post("/goals", { title, targetAmount: amountInRial, deadline });
      setTitle(""); setAmount(""); setDeadline("");
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هدف حذف شود؟")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch {
      alert("خطا در حذف هدف");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0F6F5C]" size={32} />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] p-4 sm:p-8 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Vazirmatn', sans-serif; }`}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[#8A8273] hover:text-[#26241F]"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[#26241F]">اهداف مالی</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#0F6F5C] text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            <Plus size={15} /> هدف جدید
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#EDE8DC] p-5 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-[#26241F] text-right">هدف مالی جدید</h3>
            <div>
              <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">عنوان</label>
              <input
                type="text"
                placeholder="مثال: پس‌انداز خرید ماشین"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3A372F] mb-1.5 text-right">
                مبلغ هدف ({unit})
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={`مبلغ را به ${unit} وارد کنید`}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C] text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5 text-right">ددلاین</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full text-sm bg-[#FCFBF8] border border-[#E5E1D6] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F6F5C]"
              />
            </div>
            {error && <p className="text-xs text-red-500 text-right">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-[#0F6F5C] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                ذخیره هدف
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 font-semibold rounded-xl px-4 py-2.5 text-xs"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={48} className="text-[#EDE8DC]" />
            <h3 className="text-base font-bold text-[#26241F]">هنوز هدفی ندارید</h3>
            <p className="text-sm text-[#8A8273] text-center max-w-xs leading-6">
              با تعریف هدف مالی، اپ پیشرفت شما رو دنبال میکنه و پیش‌بینی میده
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#0F6F5C] text-white text-sm font-semibold px-6 py-3 rounded-xl mt-2"
            >
              اولین هدفم رو بسازم
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} display={display} unit={unit} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
