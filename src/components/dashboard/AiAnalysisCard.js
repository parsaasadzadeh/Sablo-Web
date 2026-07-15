"use client";
import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

export default function AiAnalysisCard() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [usedToday, setUsedToday] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/ai/status");
        setUsedToday(res.data.usedToday);
        setResult(res.data.lastResult);
      } catch (err) {
        console.error("Error fetching AI status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post("/ai/analyze");
      setResult(res.data.analysis);
      setUsedToday(true);
    } catch (err) {
      console.error("Error getting AI analysis:", err);
      setError(err.response?.data?.message || "خطا در دریافت تحلیل، دوباره تلاش کنید");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-[#EDE8DC] mb-6 flex items-center justify-center h-24">
        <Loader2 className="animate-spin text-[#0F6F5C]" size={22} />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EDE8DC] mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0F6F5C]/10 rounded-xl">
            <Sparkles size={18} className="text-[#0F6F5C]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#26241F]">تحلیل هوشمند وضعیت مالی</h2>
            <p className="text-[11px] text-[#8A8273]">هر کاربر روزی یک‌بار می‌تواند از این قابلیت استفاده کند</p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || usedToday}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
            usedToday
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#0F6F5C] text-white hover:bg-[#0c5c4b]"
          }`}
        >
          {analyzing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> در حال تحلیل...
            </>
          ) : usedToday ? (
            "استفاده‌شده امروز"
          ) : (
            <>
              <RefreshCw size={14} /> بررسی
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mt-2">{error}</p>
      )}

      {result && !error && (
        <div className="mt-2 bg-[#F7F4EE] p-4 rounded-xl">
          <p className="text-xs leading-relaxed text-[#26241F] whitespace-pre-line">{result}</p>
        </div>
      )}

      {!result && !error && !analyzing && (
        <p className="text-xs text-[#8A8273] mt-2">برای دریافت تحلیل هوش مصنوعی از وضعیت مالی‌تان، روی دکمه «بررسی» کلیک کنید.</p>
      )}
    </div>
  );
}
