"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, Settings } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";

const LAST_SEEN_KEY = "notif_last_seen_count";

export default function DashboardHeader({
  notifications,
  unreadCount,
  onMarkAsRead,
  userName,
  userPhone,
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [lastSeenCount, setLastSeenCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(LAST_SEEN_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (isNotifOpen) {
      setLastSeenCount(unreadCount);
      localStorage.setItem(LAST_SEEN_KEY, String(unreadCount));
    }
  }, [isNotifOpen, unreadCount]);

  const hasNewNotifications = unreadCount > lastSeenCount;
  const newCount = Math.max(0, unreadCount - lastSeenCount);
  const greetingName = userName?.trim() || userPhone || "";

  return (
    <header className="flex items-center justify-between mb-4 bg-white dark:bg-[#1E1D1A] p-4 rounded-[20px] border border-[#EDE8DC] dark:border-[#3A3832] relative">
      <div>
        <h1 className="text-base font-bold text-[#26241F] dark:text-[#F3F0E8]">داشبورد مالی 💰</h1>
        <p className="text-[11px] text-[#8A8273] mt-0.5">
          {greetingName ? `خوش آمدید، ${greetingName}` : "مدیریت درآمد، خرج، اقساط و وام‌ها"}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* زنگ اعلان */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="اعلان‌ها"
            className="relative w-[38px] h-[38px] rounded-full bg-[#F7F4EE] dark:bg-[#141311] hover:bg-[#EFEAE0] flex items-center justify-center transition-colors"
          >
            {hasNewNotifications ? (
              <BellRing size={20} className="text-amber-600" />
            ) : (
              <Bell size={20} className="text-[#8A8273]" />
            )}
            {hasNewNotifications && (
              <span className="absolute top-0 left-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-[1.5px] border-white">
                {newCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1E1D1A] rounded-2xl shadow-xl border border-[#EDE8DC] dark:border-[#3A3832] z-50 overflow-hidden">
                <div className="p-3 border-b border-[#EDE8DC] dark:border-[#3A3832] bg-[#FBF9F4] dark:bg-[#262521] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#26241F] dark:text-[#F3F0E8]">اعلانات و یادآوری‌ها</span>
                  <span className="text-[10px] bg-[#EDE8DC] text-[#8A8273] px-2 py-0.5 rounded-full">
                    {unreadCount} جدید
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#8A8273]">پیامی ندارید</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 border-b border-[#F3EFE6] text-xs ${
                          notif.isRead ? "opacity-60" : "bg-amber-50/30"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <strong className="text-[#26241F] dark:text-[#F3F0E8]">{notif.title}</strong>
                          {!notif.isRead && (
                            <button
                              onClick={() => onMarkAsRead(notif._id)}
                              aria-label="خوانده شد"
                              className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-[#8A8273] leading-relaxed text-[11px]">{notif.message}</p>
                        <span className="text-[9px] text-[#B5AE9F] mt-2 block">
                          {formatJalaliDate(notif.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* تنظیمات (جایگزین دکمه خروج؛ خروج حالا داخل تنظیمات است) */}
        <Link
          href="/settings"
          aria-label="تنظیمات"
          className="w-[38px] h-[38px] rounded-full bg-[#F7F4EE] dark:bg-[#141311] hover:bg-[#EFEAE0] flex items-center justify-center transition-colors"
        >
          <Settings size={18} className="text-[#8A8273]" />
        </Link>
      </div>
    </header>
  );
}
