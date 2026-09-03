"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

const SLICES = [
  { key: "totalIncome",              label: "درآمد",          color: "#059669" },
  { key: "totalExpense",             label: "مخارج",          color: "#E11D48" },
  { key: "activeDebt",               label: "بدهی وام",       color: "#D97706" },
  { key: "unpaidInstallmentsAmount", label: "اقساط نپرداخته", color: "#7C3AED" },
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function buildArcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd   = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd   = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc   = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function ChartDonut({ display, unit, from, to }) {
  const [activeSlice, setActiveSlice] = useState(null);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to)   params.to   = to;
      const res = await api.get("/finance/stats", { params });
      setSummary(res.data.summary ?? null);
      setActiveSlice(null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const data = summary
    ? SLICES.filter((s) => summary[s.key] > 0).map((s) => ({ ...s, value: summary[s.key] }))
    : [];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const SIZE = 280, cx = SIZE / 2, cy = SIZE / 2, outerR = 110, innerR = 70, GAP = 2;
  let currentAngle = 0;
  const slicesWithAngles = data.map((d) => {
    const angle = total > 0 ? (d.value / total) * 360 : 0;
    const start = currentAngle;
    const end   = currentAngle + angle - GAP;
    currentAngle += angle;
    return { ...d, startAngle: start, endAngle: end };
  });
  const activeData = data.find((d) => d.key === activeSlice);

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 mb-6">
      <h3 className="text-base font-bold text-[#26241F] mb-6 text-right">توزیع مالی</h3>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-[#0F6F5C]" size={24} />
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="text-sm text-[#8A8273] text-center py-10">
          هنوز تراکنشی در این بازه ثبت نشده
        </p>
      ) : (
        <div className="flex flex-col items-center">
          {/* نمودار */}
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE}>
              {slicesWithAngles.map((s) => {
                const isActive = activeSlice === s.key;
                return (
                  <path
                    key={s.key}
                    d={buildArcPath(cx, cy, isActive ? outerR + 8 : outerR, innerR, s.startAngle, s.endAngle)}
                    fill={s.color}
                    opacity={activeSlice && !isActive ? 0.35 : 1}
                    onClick={() => setActiveSlice(activeSlice === s.key ? null : s.key)}
                    className="cursor-pointer transition-all duration-200"
                  />
                );
              })}
            </svg>

            {/* متن وسط */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeData ? (
                <>
                  <span className="text-lg font-bold" style={{ color: activeData.color }}>
                    {display(activeData.value)}
                  </span>
                  <span className="text-xs text-[#8A8273]">{unit}</span>
                  <span className="text-xs text-[#8A8273] mt-1">{activeData.label}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-[#8A8273] mb-1">کل</span>
                  <span className="text-lg font-bold text-[#26241F]">{display(total)}</span>
                  <span className="text-xs text-[#8A8273]">{unit}</span>
                </>
              )}
            </div>
          </div>

          {/* راهنما */}
          <div className="w-full mt-4 space-y-2">
            {data.map((d) => {
              const percent  = Math.round((d.value / total) * 100);
              const isActive = activeSlice === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveSlice(isActive ? null : d.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    isActive ? "bg-[#0F6F5C]/10" : "bg-[#F7F4EE] hover:bg-[#EDE8DC]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8A8273]">{percent}٪</span>
                    <span className="text-sm font-bold" style={{ color: d.color }}>
                      {display(d.value)} {unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#26241F]">{d.label}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
