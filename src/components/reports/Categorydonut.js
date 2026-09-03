"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

const PALETTE = [
  "#2563EB","#E11D48","#059669","#D97706","#7C3AED",
  "#DB2777","#0891B2","#65A30D","#EA580C","#4F46E5","#0D9488","#C026D3",
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

export default function CategoryDonut({ display, unit, from, to }) {
  const [activeType,  setActiveType]  = useState("EXPENSE");
  const [activeSlice, setActiveSlice] = useState(null);
  const [rawData,     setRawData]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeType };
      if (from) params.from = from;
      if (to)   params.to   = to;
      const res = await api.get("/finance/category-stats", { params });
      setRawData(res.data.categories ?? []);
      setActiveSlice(null);
    } catch {
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, from, to]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const data  = rawData.map((c, i) => ({
    key:   c.id,
    label: c.label,
    icon:  c.icon,
    value: c.totalAmount,
    count: c.count,
    color: PALETTE[i % PALETTE.length],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const SIZE = 280, cx = SIZE / 2, cy = SIZE / 2, outerR = 110, innerR = 68, GAP = 2;
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
      <h3 className="text-base font-bold text-[#26241F] mb-4 text-right">توزیع بر اساس دسته‌بندی</h3>

      {/* تاگل هزینه / درآمد */}
      <div className="flex flex-row-reverse gap-2 mb-5">
        <button
          onClick={() => setActiveType("EXPENSE")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            activeType === "EXPENSE"
              ? "bg-[#FDECEC] border-[#E11D48] text-[#26241F]"
              : "bg-[#F7F4EE] border-[#EDE8DC] text-[#8A8273] hover:bg-[#EDE8DC]"
          }`}
        >
          هزینه‌ها
        </button>
        <button
          onClick={() => setActiveType("INCOME")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            activeType === "INCOME"
              ? "bg-[#E6F4EA] border-[#059669] text-[#26241F]"
              : "bg-[#F7F4EE] border-[#EDE8DC] text-[#8A8273] hover:bg-[#EDE8DC]"
          }`}
        >
          درآمدها
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-[#0F6F5C]" size={24} />
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="text-sm text-[#8A8273] text-center py-10">
          {activeType === "EXPENSE"
            ? "هنوز هزینه‌ی دسته‌بندی‌شده‌ای ثبت نشده"
            : "هنوز درآمد دسته‌بندی‌شده‌ای ثبت نشده"}
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
                    opacity={activeSlice && !isActive ? 0.4 : 1}
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
                  <span className="text-xl mb-0.5">{activeData.icon}</span>
                  <span className="text-lg font-extrabold" style={{ color: activeData.color }}>
                    {display(activeData.value)}
                  </span>
                  <span className="text-xs text-[#8A8273]">{unit}</span>
                  <span className="text-xs text-[#8A8273] mt-1">{activeData.label}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-[#8A8273] mb-1">کل</span>
                  <span className="text-lg font-extrabold text-[#26241F]">{display(total)}</span>
                  <span className="text-xs text-[#8A8273]">{unit}</span>
                </>
              )}
            </div>
          </div>

          {/* راهنما */}
          <div className="w-full mt-3 space-y-2">
            {data.map((d) => {
              const percent  = total > 0 ? Math.round((d.value / total) * 100) : 0;
              const isActive = activeSlice === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveSlice(isActive ? null : d.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? "bg-[#0F6F5C]/10" : "bg-[#F7F4EE] hover:bg-[#EDE8DC]"
                  }`}
                >
                  {/* سمت چپ: مبلغ + درصد */}
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold" style={{ color: d.color }}>
                      {display(d.value)} {unit}
                    </span>
                    <span className="text-[10px] text-[#8A8273]">
                      {percent}٪ · {d.count} مورد
                    </span>
                  </div>
                  {/* سمت راست: آیکون + لیبل + دات */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#26241F]">{d.label}</span>
                    <span className="text-sm">{d.icon}</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
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
