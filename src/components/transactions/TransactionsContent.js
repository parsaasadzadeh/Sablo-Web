"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Calendar, Download, CheckCircle,
  Clock, Eye, Pencil, Trash2, ChevronRight, ChevronLeft, ArrowRight, Loader2
} from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import TransactionModal from "@/components/dashboard/TransactionModal";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";

// ── ثابت‌ها ──────────────────────────────────────────────────────────────────

const TYPE_LABELS = { INCOME: "درآمد", EXPENSE: "خرج", INSTALLMENT: "قسط", LOAN: "وام" };

const TYPE_COLORS = {
  INCOME:      "bg-emerald-50 text-emerald-700 border-emerald-100",
  EXPENSE:     "bg-rose-50    text-rose-700    border-rose-100",
  INSTALLMENT: "bg-orange-50  text-orange-700  border-orange-100",
  LOAN:        "bg-blue-50    text-blue-700    border-blue-100",
};

// ── کمک‌توابع ─────────────────────────────────────────────────────────────────

function formatJalali(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return "";
  }
}

function isoToDate(iso) {
  if (!iso) return "";
  return iso.split("T")[0];
}

// ── Pagination ────────────────────────────────────────────────────────────────

function buildPageList(current, total) {
  const SIBLINGS = 1;
  if (total <= 5 + SIBLINGS * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const left  = Math.max(current - SIBLINGS, 2);
  const right = Math.min(current + SIBLINGS, total - 1);
  const pages = [1];
  if (left  > 2)         pages.push("dots-start");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("dots-end");
  pages.push(total);
  return pages;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages  = buildPageList(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast  = currentPage >= totalPages;
  const goTo = (p) => { if (p >= 1 && p <= totalPages && p !== currentPage) onPageChange(p); };

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-[#EDE8DC] mt-4">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={isFirst}
        className="w-9 h-9 rounded-xl border border-[#EDE8DC] bg-white flex items-center justify-center disabled:opacity-30 hover:bg-[#F7F4EE] transition-colors"
      >
        <ChevronRight size={17} />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "dots-start" || p === "dots-end" ? (
            <span key={`${p}-${i}`} className="w-8 text-center text-sm text-[#8A8273]">···</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              disabled={p === currentPage}
              className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                p === currentPage
                  ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
                  : "bg-white border-[#EDE8DC] text-[#26241F] hover:bg-[#F7F4EE]"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={isLast}
        className="w-9 h-9 rounded-xl border border-[#EDE8DC] bg-white flex items-center justify-center disabled:opacity-30 hover:bg-[#F7F4EE] transition-colors"
      >
        <ChevronLeft size={17} />
      </button>
    </div>
  );
}

// ── TxRow ─────────────────────────────────────────────────────────────────────

function TxRow({ tx, onPay, onView, onEdit, onDelete, display, unit }) {
  const isPositive = tx.type === "INCOME" || tx.type === "LOAN";

  return (
    <div className="py-3.5 border-b border-[#EDE8DC] last:border-0">
      {/* ردیف بالا */}
      <div className="flex flex-row-reverse items-start gap-3">
        {/* بج نوع */}
        <div className={`shrink-0 w-12 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold border ${TYPE_COLORS[tx.type]}`}>
          {TYPE_LABELS[tx.type]}
        </div>

        {/* اطلاعات */}
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-semibold text-[#26241F] truncate">{tx.title}</p>
          {tx.description && (
            <p className="text-xs text-[#8A8273] mt-0.5 line-clamp-2">{tx.description}</p>
          )}
          {tx.categoryInfo && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#8A8273] bg-[#F7F4EE] px-2 py-0.5 rounded-full">
              {tx.categoryInfo.icon && <span>{tx.categoryInfo.icon}</span>}
              {tx.categoryInfo.label}
            </span>
          )}
          {tx.dueDate && tx.type === "INSTALLMENT" && !tx.isPaid && (
            <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              سررسید: {formatJalali(tx.dueDate)}
            </span>
          )}
        </div>

        {/* مبلغ */}
        <div className="shrink-0 text-left">
          <p className={`text-base font-extrabold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? "+" : "-"}{display(tx.amount)}
          </p>
          <p className="text-[11px] text-[#8A8273] font-medium">{unit}</p>
          <p className="text-[10px] text-[#B5AFA3] mt-0.5">{formatJalali(tx.date)}</p>
        </div>
      </div>

      {/* ردیف اکشن‌ها */}
      <div className="flex flex-row-reverse items-center justify-between mt-2.5">
        <div>
          {tx.type === "INSTALLMENT" && !tx.isPaid && (
            <button
              onClick={() => onPay(tx._id)}
              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle size={11} /> پرداخت
            </button>
          )}
          {tx.type === "INSTALLMENT" && tx.isPaid && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600">
              <CheckCircle size={11} /> پرداخت شده
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onView(tx)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F7F4EE] transition-colors">
            <Eye size={14} className="text-[#8A8273]" />
          </button>
          <button onClick={() => onEdit(tx)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F7F4EE] transition-colors">
            <Pencil size={14} className="text-[#8A8273]" />
          </button>
          <button onClick={() => onDelete(tx)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors">
            <Trash2 size={14} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── صفحه اصلی ─────────────────────────────────────────────────────────────────

export default function TransactionsContent() {
  const router = useRouter();
  const { display, unit, currency } = useCurrency();

  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [downloading,   setDownloading]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalItems,    setTotalItems]    = useState(0);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [fromDate,      setFromDate]      = useState("");
  const [toDate,        setToDate]        = useState("");
  const [showDateFilter,setShowDateFilter]= useState(false);

  const [selectedTx,    setSelectedTx]    = useState(null);
  const [editingTx,     setEditingTx]     = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  const [categories,         setCategories]         = useState([]);
  const [categoryFormLoading,setCategoryFormLoading] = useState(false);

  const searchTimeoutRef = useRef(null);
  const hasDateFilter = Boolean(fromDate || toDate);

  // ── fetch ───────────────────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async (page = 1, search = "", from = "", to = "") => {
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (from)   params.from   = isoToDate(from);
      if (to)     params.to     = isoToDate(to);
      const res = await api.get("/finance/my-data", { params });
      setTransactions(res.data.transactions ?? []);
      setCurrentPage(res.data.currentPage ?? 1);
      setTotalPages(res.data.totalPages ?? 1);
      setTotalItems(res.data.totalItems ?? 0);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/finance/categories");
      setCategories(res.data.categories ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransactions(1, "", "", "");
    fetchCategories();
  }, []);

  // ── ساخت دسته‌بندی شخصی ─────────────────────────────────────────────────────

  const createCustomCategory = useCallback(async (label, icon) => {
    setCategoryFormLoading(true);
    try {
      const res = await api.post("/finance/categories/custom", { label, icon });
      const newCat = res.data.category;
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "خطا در ساخت دسته‌بندی" };
    } finally {
      setCategoryFormLoading(false);
    }
  }, []);

  // ── دانلود CSV ──────────────────────────────────────────────────────────────

  const handleDownloadCSV = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (fromDate)    params.append("from", isoToDate(fromDate));
      if (toDate)      params.append("to",   isoToDate(toDate));

      const res = await api.get(
        `/finance/export-csv${params.toString() ? "?" + params.toString() : ""}`,
        { responseType: "text", transformResponse: [(d) => d] }
      );
      const csvText = typeof res.data === "string" ? res.data : String(res.data);
      const bom  = csvText.startsWith("\uFEFF") ? csvText : "\uFEFF" + csvText;
      const blob = new Blob([bom], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `sablo-transactions-${Date.now()}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) {
      alert("خطا در دانلود فایل");
    } finally {
      setDownloading(false);
    }
  };

  // ── سرچ با debounce ─────────────────────────────────────────────────────────

  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchTransactions(1, text, fromDate, toDate);
    }, 500);
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, fromDate, toDate);
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setFromDate(""); setToDate("");
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, "", "");
    setShowDateFilter(false);
  };

  // ── حذف ────────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (tx) => {
    const msg = tx.type === "LOAN"
      ? `آیا مطمئنید می‌خواهید وام «${tx.title}» را حذف کنید؟ تمام اقساط هم حذف خواهند شد.`
      : `آیا مطمئنید می‌خواهید تراکنش «${tx.title}» را حذف کنید؟`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/finance/delete/${tx._id}`);
      fetchTransactions(currentPage, searchQuery, fromDate, toDate);
    } catch (err) {
      alert(err.response?.data?.message || "خطا در حذف");
    }
  }, [currentPage, searchQuery, fromDate, toDate, fetchTransactions]);

  // ── پرداخت قسط ─────────────────────────────────────────────────────────────

  const handlePayInstallment = useCallback(async (id) => {
    try {
      await api.put(`/finance/pay-installment/${id}`, {});
      fetchTransactions(currentPage, searchQuery, fromDate, toDate);
    } catch {
      alert("خطا در پرداخت قسط");
    }
  }, [currentPage, searchQuery, fromDate, toDate, fetchTransactions]);

  // ── ویرایش ─────────────────────────────────────────────────────────────────

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  // ── تغییر صفحه ─────────────────────────────────────────────────────────────

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchTransactions(page, searchQuery, fromDate, toDate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, fromDate, toDate, fetchTransactions]);

  // ── رندر ────────────────────────────────────────────────────────────────────

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Vazirmatn', sans-serif; }`}</style>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">

        {/* هدر */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* دانلود */}
            <button
              onClick={handleDownloadCSV}
              disabled={downloading}
              className="w-9 h-9 rounded-xl border border-[#0F6F5C] bg-[#E6F4F1] flex items-center justify-center hover:bg-[#CCE9E3] transition-colors disabled:opacity-50"
              title="دانلود CSV"
            >
              {downloading
                ? <Loader2 size={15} className="animate-spin text-[#0F6F5C]" />
                : <Download size={15} className="text-[#0F6F5C]" />
              }
            </button>

            {/* افزودن جدید */}
            <button
              onClick={() => { setEditingTx(null); setIsModalOpen(true); }}
              className="bg-[#0F6F5C] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#0a5c4a] transition-colors"
            >
              + جدید
            </button>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#26241F]">تراکنش‌ها</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-sm text-[#8A8273] hover:text-[#26241F] transition-colors"
            >
              <ArrowRight size={15} />
              بازگشت
            </button>
          </div>
        </div>

        {/* سرچ و فیلتر */}
        <div className="flex flex-row-reverse gap-2 mb-3">
          <div className="flex-1 flex flex-row-reverse items-center gap-2 bg-white border border-[#EDE8DC] rounded-xl px-3 py-2.5">
            <Search size={14} className="text-[#8A8273] shrink-0" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 text-sm text-right bg-transparent outline-none text-[#26241F] placeholder:text-[#B5AFA3]"
            />
            {searchQuery && (
              <button onClick={() => handleSearch("")}>
                <X size={13} className="text-[#8A8273]" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
              hasDateFilter
                ? "bg-[#0F6F5C] border-[#0F6F5C] text-white"
                : "bg-white border-[#EDE8DC] text-[#0F6F5C] hover:bg-[#F7F4EE]"
            }`}
          >
            <Calendar size={15} />
          </button>
        </div>

        {/* پانل فیلتر تاریخ */}
        {showDateFilter && (
          <div className="bg-white border border-[#EDE8DC] rounded-2xl p-4 mb-4">
            <div className="flex flex-row-reverse gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-[#8A8273] mb-1.5 text-right">از تاریخ</label>
                <input
                  type="date"
                  value={fromDate ? isoToDate(fromDate) : ""}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-sm bg-[#F7F4EE] border border-[#EDE8DC] rounded-xl px-3 py-2 outline-none focus:border-[#0F6F5C] text-right"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-[#8A8273] mb-1.5 text-right">تا تاریخ</label>
                <input
                  type="date"
                  value={toDate ? isoToDate(toDate) : ""}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-sm bg-[#F7F4EE] border border-[#EDE8DC] rounded-xl px-3 py-2 outline-none focus:border-[#0F6F5C] text-right"
                />
              </div>
            </div>
            <div className="flex flex-row-reverse gap-2">
              <button
                onClick={applyDateFilter}
                className="flex-1 bg-[#0F6F5C] text-white text-xs font-bold rounded-xl py-2.5 hover:bg-[#0a5c4a] transition-colors"
              >
                اعمال فیلتر
              </button>
              {hasDateFilter && (
                <button
                  onClick={clearDateFilter}
                  className="bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-rose-100 transition-colors"
                >
                  حذف فیلتر
                </button>
              )}
            </div>
          </div>
        )}

        {/* کارت لیست */}
        <div className="bg-white rounded-2xl border border-[#EDE8DC] shadow-sm">

          {/* سر کارت */}
          {!loading && totalItems > 0 && (
            <div className="px-4 py-3 border-b border-[#EDE8DC] flex flex-row-reverse items-center justify-between">
              <span className="text-xs text-[#8A8273]">{totalItems} تراکنش</span>
              {hasDateFilter && (
                <span className="text-[10px] text-[#0F6F5C] font-medium">
                  {fromDate ? formatJalali(fromDate) : "..."} تا {toDate ? formatJalali(toDate) : "..."}
                </span>
              )}
            </div>
          )}

          <div className="px-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#0F6F5C]" size={24} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm text-[#8A8273]">
                  {searchQuery || hasDateFilter ? "تراکنشی با این فیلتر یافت نشد" : "تراکنشی یافت نشد"}
                </p>
                {!searchQuery && !hasDateFilter && (
                  <button
                    onClick={() => { setEditingTx(null); setIsModalOpen(true); }}
                    className="text-xs text-[#0F6F5C] font-semibold hover:underline mt-1"
                  >
                    اولین تراکنشت رو ثبت کن
                  </button>
                )}
              </div>
            ) : (
              transactions.map((tx) => (
                <TxRow
                  key={tx._id}
                  tx={tx}
                  onPay={handlePayInstallment}
                  onView={setSelectedTx}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  display={display}
                  unit={unit}
                />
              ))
            )}
          </div>

          {/* صفحه‌بندی */}
          {!loading && totalPages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* مودال جزئیات */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onEdit={(tx) => { setSelectedTx(null); openEditModal(tx); }}
        onDelete={(tx) => { setSelectedTx(null); handleDelete(tx); }}
        onPayInstallment={(id) => { handlePayInstallment(id); setSelectedTx(null); }}
      />

      {/* مودال ثبت/ویرایش */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTx(null); }}
        onRefreshData={() => fetchTransactions(currentPage, searchQuery, fromDate, toDate)}
        editingTransaction={editingTx}
        categories={categories}
        onCreateCategory={createCustomCategory}
        categoryFormLoading={categoryFormLoading}
      />
    </div>
  );
}
