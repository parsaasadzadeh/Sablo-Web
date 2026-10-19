"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Pencil, Trash2, Tag, X, Loader2 } from "lucide-react";
import api from "@/lib/axios";

const INPUT =
  "bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] outline-none focus:border-[color:var(--brand)] transition-colors";

/* ───────── مودال ساخت / ویرایش ───────── */
function CategoryFormModal({ open, editing, loading, onClose, onSubmit }) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState("");

  // هر بار که مودال باز می‌شود فرم با مقدار دسته‌ی در حال ویرایش (یا خالی) پر شود
  useEffect(() => {
    if (!open) return;
    setLabel(editing?.label ?? "");
    setIcon(editing?.icon ?? "");
    setError("");
  }, [open, editing]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setError("نام دسته‌بندی را وارد کنید");
      return;
    }
    onSubmit({ label: trimmed, icon: icon.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--overlay)]"
      onClick={() => !loading && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-[var(--card)] rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-3.5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[color:var(--ink)]">
            {editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="بستن"
            className="p-1.5 rounded-full hover:bg-[var(--hover)] disabled:opacity-50"
          >
            <X size={20} className="text-[color:var(--muted)]" />
          </button>
        </div>

        <div className="flex gap-2.5">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="😀"
            maxLength={4}
            aria-label="آیکن (ایموجی)"
            className={`${INPUT} w-14 text-center text-[22px] px-1 py-2`}
          />
          <input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (error) setError("");
            }}
            placeholder="نام دسته‌بندی"
            maxLength={30}
            autoFocus
            aria-label="نام دسته‌بندی"
            className={`${INPUT} flex-1 min-w-0`}
          />
        </div>

        {error && <p className="text-xs font-semibold text-[color:var(--danger)] -mt-1.5">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-[15px] font-bold rounded-xl py-3.5 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : editing ? (
            "ذخیره تغییرات"
          ) : (
            "ساخت دسته‌بندی"
          )}
        </button>
      </form>
    </div>
  );
}

/* ───────── صفحه ───────── */
export default function CategoriesContent() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null یعنی «ساخت جدید»
  const [formLoading, setFormLoading] = useState(false);

  const customCategories = categories.filter((c) => c.isCustom);
  const presetCategories = categories.filter((c) => !c.isCustom);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/finance/categories");
      setCategories(res.data.categories ?? []);
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/");
        return;
      }
      setNotice({ type: "error", text: "خطا در دریافت دسته‌بندی‌ها" });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // پیام موفقیت/خطا بعد از چند ثانیه محو شود
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setFormOpen(true); };
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmit = async ({ label, icon }) => {
    setFormLoading(true);
    try {
      if (editing) {
        const res = await api.put(`/finance/categories/custom/${editing.id}`, { label, icon });
        const updated = res.data.category;
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      } else {
        const res = await api.post("/finance/categories/custom", { label, icon });
        setCategories((prev) => [...prev, res.data.category]);
      }
      setFormOpen(false);
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "خطا در ذخیره دسته‌بندی" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(
      `دسته‌بندی «${cat.label}» حذف شود؟\nتراکنش‌های این دسته به «سایر» منتقل می‌شوند و بودجه‌ی آن هم حذف می‌شود.`
    )) return;

    try {
      await api.delete(`/finance/categories/custom/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setNotice({ type: "success", text: "دسته‌بندی حذف شد" });
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "خطا در حذف دسته‌بندی" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[color:var(--brand)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)]">
      <header className="flex items-center justify-between px-4 py-3.5 bg-[var(--card)] border-b border-[color:var(--border)]">
        <button onClick={() => router.back()} aria-label="بازگشت" className="p-1 w-8">
          <ChevronRight size={24} className="text-[color:var(--ink)]" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[color:var(--ink)]">مدیریت دسته‌بندی‌ها</h1>
        <div className="w-8" />
      </header>

      <main className="max-w-xl mx-auto p-4 pb-10">
        {notice && (
          <div
            role="status"
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
              notice.type === "success"
                ? "bg-[var(--emerald-bg)] text-[color:var(--emerald-text)] border-[color:var(--border)]"
                : "bg-[var(--danger-light)] text-[color:var(--danger)] border-[color:var(--danger-border)]"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* دسته‌های شخصی */}
        <h2 className="text-[15px] font-bold text-[color:var(--ink)] mb-2.5">دسته‌بندی‌های من</h2>

        {customCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-7">
            <Tag size={40} className="text-[color:var(--muted)]" />
            <p className="text-sm font-bold text-[color:var(--ink)]">هنوز دسته‌بندی شخصی نساختی</p>
            <p className="text-xs text-[color:var(--muted)]">مثلاً «گازوئیل» یا «شهریه»</p>
          </div>
        ) : (
          customCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 bg-[var(--card)] border border-[color:var(--border)] rounded-[14px] p-3.5 mb-2.5"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-[22px]">{cat.icon || "🏷️"}</span>
                <span className="text-[15px] font-semibold text-[color:var(--ink)] truncate">{cat.label}</span>
              </div>
              <div className="flex items-center gap-[18px]">
                <button
                  onClick={() => openEdit(cat)}
                  aria-label={`ویرایش ${cat.label}`}
                  className="text-[color:var(--info)] hover:opacity-70 transition-opacity"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  aria-label={`حذف ${cat.label}`}
                  className="text-[color:var(--danger)] hover:opacity-70 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}

        <button
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[color:var(--brand)] rounded-[14px] py-3.5 mt-1 text-sm font-bold text-[color:var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
        >
          <Plus size={20} /> دسته‌بندی جدید
        </button>

        {/* دسته‌های پیش‌فرض (فقط نمایش) */}
        {presetCategories.length > 0 && (
          <>
            <h2 className="text-[15px] font-bold text-[color:var(--ink)] mt-6 mb-2.5">دسته‌بندی‌های پیش‌فرض</h2>
            <p className="text-xs text-[color:var(--muted)] mb-2.5">این‌ها قابل ویرایش یا حذف نیستند.</p>
            <div className="flex flex-wrap gap-2">
              {presetCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1.5 px-3 py-[7px] rounded-full bg-[var(--card)] border border-[color:var(--border)]"
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-xs text-[color:var(--muted)]">{cat.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <CategoryFormModal
        open={formOpen}
        editing={editing}
        loading={formLoading}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}