"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, ChevronUp, Lightbulb, ArrowLeft } from "lucide-react";
import { TUTORIAL_TOPICS } from "./tutorialTopics";

const toPersianNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// رنگ هر tone از توکن‌های تم (در حالت دارک خودکار عوض می‌شود)
const TONES = {
  brand:   { fg: "var(--brand)",   bg: "var(--brand-light)" },
  info:    { fg: "var(--info)",    bg: "var(--info-light)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-light)" },
  danger:  { fg: "var(--danger)",  bg: "var(--danger-light)" },
};

export default function TutorialModal({ open, onClose }) {
  const router = useRouter();
  const [openId, setOpenId] = useState(TUTORIAL_TOPICS[0].id);

  // بستن با Escape و قفل اسکرول صفحه‌ی پشت مودال
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const goTo = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--overlay)]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] bg-[var(--card)] rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* هدر */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[color:var(--border)]">
          <div>
            <h2 id="tutorial-title" className="text-base font-bold text-[color:var(--ink)]">
              آموزش استفاده از سابلو
            </h2>
            <p className="text-xs text-[color:var(--muted)] mt-0.5">روی هر بخش بزن تا مراحلش باز شود</p>
          </div>
          <button onClick={onClose} aria-label="بستن" className="p-1.5 rounded-full hover:bg-[var(--hover)]">
            <X size={22} className="text-[color:var(--muted)]" />
          </button>
        </div>

        {/* لیست موضوع‌ها */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {TUTORIAL_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const t = TONES[topic.tone] || TONES.brand;
            const isOpen = openId === topic.id;

            return (
              <div
                key={topic.id}
                className="bg-[var(--bg)] rounded-[14px] border border-[color:var(--border)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : topic.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-right hover:bg-[var(--hover)] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[color:var(--ink)]">{topic.title}</div>
                    <div className="text-[11px] text-[color:var(--muted)] mt-0.5">{topic.summary}</div>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-[color:var(--muted)]" />
                  ) : (
                    <ChevronDown size={18} className="text-[color:var(--muted)]" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-[color:var(--border)] space-y-2.5">
                    {topic.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 mt-1.5">
                        <div
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-px text-[11px] font-bold"
                          style={{ background: t.bg, color: t.fg }}
                        >
                          {toPersianNum(idx + 1)}
                        </div>
                        <p className="flex-1 text-[13px] leading-[21px] text-[color:var(--ink)]">{step}</p>
                      </div>
                    ))}

                    {topic.tip && (
                      <div className="flex items-start gap-2 bg-[var(--warning-light)] rounded-[10px] px-2.5 py-2">
                        <Lightbulb size={14} className="text-[color:var(--warning)] shrink-0 mt-0.5" />
                        <p className="flex-1 text-xs leading-[19px] text-[color:var(--warning)]">{topic.tip}</p>
                      </div>
                    )}

                    {topic.route && (
                      <button
                        onClick={() => goTo(topic.route)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[13px] font-bold hover:opacity-80 transition-opacity"
                        style={{ borderColor: t.fg, color: t.fg }}
                      >
                        {topic.routeLabel}
                        <ArrowLeft size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
