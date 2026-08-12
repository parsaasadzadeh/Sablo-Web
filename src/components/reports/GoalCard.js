"use client";
import { Trash2, Target, TrendingUp, Clock } from "lucide-react";

export default function GoalCard({ goal, display, unit, onDelete }) {
  const statusColor = goal.isCompleted
    ? "#059669"
    : goal.isExpired
    ? "#E11D48"
    : "#0F6F5C";

  const deadlineDate = new Date(goal.deadline).toLocaleDateString("fa-IR");
  const percent = Math.min(100, goal.percent);

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-5 mb-4">
      {/* هدر */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onDelete(goal._id)}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-[#26241F]">{goal.title}</h4>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Target size={16} style={{ color: statusColor }} />
          </div>
        </div>
      </div>

      {/* نوار پیشرفت */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold" style={{ color: statusColor }}>
          {percent}٪
        </span>
        <div className="flex-1 h-2 bg-[#EDE8DC] rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: statusColor }}
          />
        </div>
      </div>

      {/* مبالغ */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-emerald-50 rounded-xl">
          <p className="text-[10px] text-[#8A8273] mb-1">پس‌انداز شده</p>
          <p className="text-xs font-bold text-emerald-600 tabular">
            {display(goal.savedAmount)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
        <div className="text-center p-2 bg-rose-50 rounded-xl">
          <p className="text-[10px] text-[#8A8273] mb-1">باقی‌مانده</p>
          <p className="text-xs font-bold text-rose-600 tabular">
            {display(goal.remaining)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
        <div className="text-center p-2 bg-[#F7F4EE] rounded-xl">
          <p className="text-[10px] text-[#8A8273] mb-1">هدف</p>
          <p className="text-xs font-bold text-[#26241F] tabular">
            {display(goal.targetAmount)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
      </div>

      {/* فوتر */}
      <div className="flex items-center justify-between pt-3 border-t border-[#EDE8DC]">
        <div className="flex items-center gap-1 text-[#8A8273]">
          <Clock size={12} />
          <span className="text-xs">ددلاین: {deadlineDate}</span>
        </div>

        {goal.isCompleted ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
            🎉 به هدف رسیدی!
          </span>
        ) : goal.isExpired ? (
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
            منقضی شده
          </span>
        ) : goal.predictedMonths !== null ? (
          <div className="flex items-center gap-1 text-[#0F6F5C]">
            <TrendingUp size={12} />
            <span className="text-xs font-bold">
              پیش‌بینی: {goal.predictedMonths} ماه دیگه
            </span>
          </div>
        ) : (
          <span className="text-xs text-[#8A8273]">در حال محاسبه...</span>
        )}
      </div>
    </div>
  );
}
