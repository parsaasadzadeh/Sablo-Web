"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const AlertContext = createContext(null);
let toastIdCounter = 0;

const TOAST_VARIANTS = {
  success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", Icon: CheckCircle, iconColor: "text-emerald-600" },
  error: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", Icon: XCircle, iconColor: "text-rose-600" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", Icon: AlertTriangle, iconColor: "text-amber-600" },
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", Icon: Info, iconColor: "text-blue-600" },
};

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  // نمایش پیام موقت (جایگزین alert())
  const showAlert = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // نمایش مودال تأیید (جایگزین window.confirm()) - یک Promise<boolean> برمی‌گردونه
  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        title: options.title || "تأیید عملیات",
        confirmText: options.confirmText || "تأیید",
        cancelText: options.cancelText || "انصراف",
        variant: options.variant || "default", // "default" | "danger"
        resolve,
      });
    });
  }, []);

  const resolveConfirm = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* کانتینر توست‌ها */}
      <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:left-6 z-[100] flex flex-col gap-2 sm:w-full sm:max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const v = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 ${v.bg} ${v.border} border rounded-2xl shadow-lg px-4 py-3 toast-enter`}
            >
              <v.Icon size={18} className={`${v.iconColor} shrink-0 mt-0.5`} />
              <p className={`text-xs font-medium leading-5 flex-1 ${v.text}`}>{toast.message}</p>
              <button onClick={() => dismissToast(toast.id)} className={`shrink-0 ${v.text} opacity-60 hover:opacity-100 transition-opacity`}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* مودال تأیید */}
      {confirmState && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-[110]"
          onClick={() => resolveConfirm(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 sm:p-6 border border-[#EDE8DC] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmState.variant === "danger" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0 pt-1">
                <h4 className="text-sm font-bold text-[#26241F]">{confirmState.title}</h4>
                <p className="text-xs text-[#8A8273] mt-1.5 leading-5 break-words">{confirmState.message}</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => resolveConfirm(true)}
                className={`flex-1 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors ${
                  confirmState.variant === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#0F6F5C] hover:bg-[#0C5A4A]"
                }`}
              >
                {confirmState.confirmText}
              </button>
              <button
                onClick={() => resolveConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl py-2.5 transition-colors"
              >
                {confirmState.cancelText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-enter { animation: toast-slide-up 0.25s ease-out; }
      `}</style>
    </AlertContext.Provider>
  );
}

// هوک استفاده در هر کامپوننت:
// const { showAlert, showConfirm } = useAlert();
// showAlert("تراکنش با موفقیت ثبت شد", "success");
// const ok = await showConfirm("آیا مطمئنید؟", { variant: "danger", confirmText: "حذف" });
export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert باید داخل <AlertProvider> استفاده شود");
  return ctx;
}
