'use client';

import { useEffect, useState, useCallback } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2, X, ChevronDown } from 'lucide-react';

// ─── رنگ‌ها ───────────────────────────────────────────────────────────────────
const C = {
  brand: '#0F6F5C',
  brandLight: '#E8F5F1',
  bg: '#F7F3EB',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#8A8273',
  border: '#EDE8DC',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
};

const CARD_COLORS = [
  '#0F6F5C', '#1E40AF', '#7C3AED', '#B45309',
  '#DC2626', '#0369A1', '#065F46', '#831843',
];

const CARD_ICONS = ['💳', '🏦', '💰', '🏧', '💵', '🪙', '💎', '🎯'];

// ─── شبیه‌سازی API ─────────────────────────────────────────────────────────────
const mockApi = {
  getCards: () => new Promise((res) =>
    setTimeout(() => res([
      { _id: '1', name: 'بانک ملت', icon: '🏦', color: '#0F6F5C', description: 'حساب جاری' },
      { _id: '2', name: 'پاسارگاد', icon: '💳', color: '#1E40AF', description: 'حساب پس‌انداز' },
    ]), 800)
  ),
  createCard: (data) => new Promise((res) =>
    setTimeout(() => res({ ...data, _id: Date.now().toString() }), 600)
  ),
  deleteCard: (id, deleteTransactions) => new Promise((res) =>
    setTimeout(() => res({ id, deleteTransactions }), 500)
  ),
};

// ─── Dialog تأیید ─────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmText, cancelText, variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
        <h3 className="mb-2 text-right text-[17px] font-bold" style={{ color: C.text }}>{title}</h3>
        <p className="mb-6 text-right text-sm leading-6" style={{ color: C.muted }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-[2] rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: variant === 'danger' ? C.danger : C.brand }}
          >
            {confirmText || 'تأیید'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ color: C.muted, border: `1px solid ${C.border}` }}
          >
            {cancelText || 'انصراف'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, variant, visible }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300"
      style={{
        backgroundColor: variant === 'success' ? C.brand : C.danger,
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}

// ─── کامپوننت اصلی ─────────────────────────────────────────────────────────────
export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // فرم
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💳');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [description, setDescription] = useState('');

  // Dialog
  const [dialog, setDialog] = useState({ open: false });

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'success' });

  const showToast = (message, variant = 'success') => {
    setToast({ visible: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const showConfirm = (title, message, options = {}) =>
    new Promise((resolve) => {
      setDialog({
        open: true, title, message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        variant: options.variant || 'danger',
        onConfirm: () => { setDialog({ open: false }); resolve(true); },
        onCancel: () => { setDialog({ open: false }); resolve(false); },
      });
    });

  // ─── دریافت کارت‌ها ─────────────────────────────────────────────────────────
  const fetchCards = useCallback(async () => {
    try {
      // جایگزین با: const res = await api.get('/cards', { headers: { Authorization: `Bearer ${token}` } });
      const data = await mockApi.getCards();
      setCards(data);
    } catch {
      showToast('خطا در دریافت کارت‌ها', 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  // ─── ریست فرم ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setName('');
    setSelectedIcon('💳');
    setSelectedColor(CARD_COLORS[0]);
    setDescription('');
  };

  // ─── ساخت کارت ─────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      showToast('نام کارت الزامی است', 'danger');
      return;
    }
    setFormLoading(true);
    try {
      // جایگزین با: const res = await api.post('/cards', {...}, { headers: {...} });
      const newCard = await mockApi.createCard({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        description: description.trim(),
      });
      setCards((prev) => [...prev, newCard]);
      setIsCreateOpen(false);
      resetForm();
      showToast('کارت با موفقیت ساخته شد');
    } catch {
      showToast('خطا در ساخت کارت', 'danger');
    } finally {
      setFormLoading(false);
    }
  }, [name, selectedIcon, selectedColor, description]);

  // ─── حذف کارت ──────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (card) => {
    const confirmed = await showConfirm(
      'حذف کارت',
      `آیا مطمئنید که می‌خواهید کارت «${card.name}» را حذف کنید؟`,
      { confirmText: 'بله، حذف شود', variant: 'danger' }
    );
    if (!confirmed) return;

    const alsoDeleteTx = await showConfirm(
      'تراکنش‌های کارت',
      `تراکنش‌های مرتبط با کارت «${card.name}» چه بشوند؟`,
      { confirmText: 'حذف تراکنش‌ها', cancelText: 'نگه‌دار تراکنش‌ها', variant: 'danger' }
    );

    try {
      // جایگزین با: await api.delete(`/cards/${card._id}?deleteTransactions=${alsoDeleteTx}`, ...);
      await mockApi.deleteCard(card._id, alsoDeleteTx);
      setCards((prev) => prev.filter((c) => c._id !== card._id));
      if (activeCard?._id === card._id) setActiveCard(null);
      showToast(
        alsoDeleteTx ? 'کارت و تراکنش‌های آن حذف شدند' : 'کارت حذف شد، تراکنش‌ها حفظ شدند'
      );
    } catch {
      showToast('خطا در حذف کارت', 'danger');
    }
  }, [cards, activeCard]);

  // ─── رندر ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: 'inherit' }} dir="rtl">

      {/* ── هدر صفحه ── */}
      <div className="px-4 pb-2 pt-8 sm:px-8">
        <h1 className="text-2xl font-bold" style={{ color: C.text }}>کارت‌های من</h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          {activeCard ? `فعال: ${activeCard.name}` : 'بدون کارت انتخابی'}
        </p>
      </div>

      <div className="mx-auto max-w-xl px-4 py-4 sm:px-8">

        {/* ── بنر کارت فعال ── */}
        {activeCard && (
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex w-full items-center justify-between rounded-2xl p-4 text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: activeCard.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeCard.icon}</span>
              <div className="text-right">
                <p className="text-[11px] opacity-75">کارت فعال</p>
                <p className="text-base font-bold">{activeCard.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <X size={18} />
              <span className="text-[10px] opacity-75">لغو انتخاب</span>
            </div>
          </button>
        )}

        {/* ── حالت لودینگ ── */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: `${C.brand}40`, borderTopColor: C.brand }}
            />
            <p className="text-sm" style={{ color: C.muted }}>در حال بارگذاری...</p>
          </div>
        )}

        {/* ── حالت خالی ── */}
        {!loading && cards.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: C.brandLight }}>
              <CreditCard size={40} color={C.brand} />
            </div>
            <p className="text-lg font-semibold" style={{ color: C.text }}>هنوز کارتی نداری</p>
            <p className="text-sm text-center" style={{ color: C.muted }}>
              کارت بساز تا تراکنش‌هات رو دسته‌بندی کنی
            </p>
          </div>
        )}

        {/* ── لیست کارت‌ها ── */}
        {!loading && cards.map((card) => {
          const isActive = activeCard?._id === card._id;
          return (
            <button
              key={card._id}
              onClick={() => setActiveCard(isActive ? null : card)}
              className="mb-3 flex w-full items-center overflow-hidden rounded-2xl bg-white text-right transition-shadow hover:shadow-md"
              style={{
                border: `2px solid ${isActive ? C.brand : 'transparent'}`,
                boxShadow: isActive ? `0 0 0 3px ${C.brand}22` : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* نوار رنگی */}
              <div className="w-1.5 self-stretch" style={{ backgroundColor: card.color }} />

              <div className="flex flex-1 items-center justify-between p-4">
                {/* آیکون + اطلاعات */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: card.color + '22' }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px]" style={{ color: C.text }}>{card.name}</p>
                    {card.description && (
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{card.description}</p>
                    )}
                  </div>
                </div>

                {/* تیک + حذف */}
                <div className="flex items-center gap-3">
                  {isActive && <CheckCircle2 size={20} color={C.brand} />}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(card); }}
                    className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                    aria-label="حذف کارت"
                  >
                    <Trash2 size={17} color={C.danger} />
                  </button>
                </div>
              </div>
            </button>
          );
        })}

        {/* ── دکمه افزودن ── */}
        {!loading && cards.length < 5 && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-semibold transition-colors hover:bg-white"
            style={{ borderColor: C.brand, color: C.brand }}
          >
            <Plus size={18} />
            کارت جدید
          </button>
        )}

        {!loading && cards.length >= 5 && (
          <p className="mt-3 text-center text-sm" style={{ color: C.muted }}>
            به حداکثر ۵ کارت رسیدی
          </p>
        )}
      </div>

      {/* ── مودال ساخت کارت ── */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setIsCreateOpen(false); resetForm(); } }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-10 sm:rounded-3xl sm:pb-6"
            dir="rtl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: C.text }}>کارت جدید</h2>
              <button
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <X size={20} color={C.muted} />
              </button>
            </div>

            {/* پیش‌نمایش */}
            <div
              className="mb-5 flex items-center gap-3 rounded-2xl p-5"
              style={{ backgroundColor: selectedColor }}
            >
              <span className="text-3xl">{selectedIcon}</span>
              <p className="flex-1 truncate text-right text-lg font-bold text-white">
                {name || 'نام کارت'}
              </p>
            </div>

            {/* نام */}
            <input
              type="text"
              placeholder="نام کارت (مثلاً ملت، پاسارگاد)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="mb-3 w-full rounded-xl px-4 py-3 text-right text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: C.bg,
                border: `1px solid ${C.border}`,
                color: C.text,
                focusRingColor: C.brand,
              }}
            />

            {/* توضیح */}
            <input
              type="text"
              placeholder="توضیح (اختیاری)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              className="mb-4 w-full rounded-xl px-4 py-3 text-right text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: C.bg,
                border: `1px solid ${C.border}`,
                color: C.text,
              }}
            />

            {/* آیکون */}
            <p className="mb-2 text-right text-xs" style={{ color: C.muted }}>آیکون</p>
            <div className="mb-4 flex flex-wrap gap-2 justify-start">
              {CARD_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-colors"
                  style={{
                    backgroundColor: selectedIcon === icon ? C.brandLight : C.bg,
                    border: `2px solid ${selectedIcon === icon ? C.brand : 'transparent'}`,
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* رنگ */}
            <p className="mb-2 text-right text-xs" style={{ color: C.muted }}>رنگ</p>
            <div className="mb-6 flex flex-wrap gap-2.5 justify-start">
              {CARD_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="h-9 w-9 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    border: `3px solid ${selectedColor === color ? C.text : 'transparent'}`,
                    outline: selectedColor === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={formLoading}
                className="flex-[2] rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: C.brand }}
              >
                {formLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    در حال ساخت...
                  </span>
                ) : 'بساز'}
              </button>
              <button
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ border: `1px solid ${C.border}`, color: C.muted }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialog تأیید ── */}
      <ConfirmDialog {...dialog} />

      {/* ── Toast ── */}
      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </div>
  );
}
