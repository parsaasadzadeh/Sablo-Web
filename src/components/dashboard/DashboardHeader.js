"use client";
import { useState, useEffect } from "react";
import { Bell, BellRing, Check, LogOut } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";

const LAST_SEEN_KEY = "notif_last_seen_count";

export default function DashboardHeader({ notifications, unreadCount, onMarkAsRead, onLogout }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ⭐ مقدار اولیه رو از localStorage می‌خونیم تا بعد از رفرش هم حفظ بشه
  const [lastSeenCount, setLastSeenCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(LAST_SEEN_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // وقتی پنل بازه، لحظه‌به‌لحظه با unreadCount همگام‌ش کن و در localStorage هم ذخیره کن
  useEffect(() => {
    if (isNotifOpen) {
      setLastSeenCount(unreadCount);
      localStorage.setItem(LAST_SEEN_KEY, String(unreadCount));
    }
  }, [isNotifOpen, unreadCount]);

  const hasNewNotifications = unreadCount > lastSeenCount;
  const newCount = Math.max(0, unreadCount - lastSeenCount);

  return (
    <header className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-[#EDE8DC] relative">
      <div>
        <h1 className="text-xl font-bold text-[#26241F]">داشبورد مدیریت مالی 💰</h1>
        <p className="text-xs text-[#8A8273] mt-1">مدیریت درآمدها، مخارج، اقساط و بدهی‌های شما</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            {hasNewNotifications ? (
              <BellRing size={20} className="text-amber-600 animate-pulse" />
            ) : (
              <Bell size={20} className="text-gray-500" />
            )}
            {hasNewNotifications && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                {newCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">اعلانات و یادآوری‌ها</span>
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{unreadCount} جدید</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">پیامی ندارید</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className={`p-3 border-b border-gray-50 text-xs ${notif.isRead ? 'opacity-60 bg-white' : 'bg-amber-50/30'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-gray-800">{notif.title}</strong>
                        {!notif.isRead && (
                          <button onClick={() => onMarkAsRead(notif._id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed text-[11px]">{notif.message}</p>
                      <span className="text-[9px] text-gray-400 mt-2 block">{formatJalaliDate(notif.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-colors">
          <LogOut size={16} /> خروج
        </button>
      </div>
    </header>
  );
}
