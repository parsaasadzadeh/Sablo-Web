"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

import { CurrencyProvider } from "@/context/currencyContext";
import { CardProvider, useCard } from "@/context/cardContext";   // ← جدید
import DashboardHeader  from "@/components/dashboard/DashboardHeader";
import StatsGrid        from "@/components/dashboard/StatsGrid";
import TransactionList  from "@/components/dashboard/TransactionList";
import TransactionModal from "@/components/dashboard/TransactionModal";
import AiAnalysisCard   from "@/components/dashboard/AiAnalysisCard";
import CurrencyToggle   from "@/components/dashboard/CurrencyToggle";
import QuickNav         from "@/components/dashboard/QuickNav";
import ActiveCardBanner from "@/components/dashboard/ActiveCardBanner";  // ← جدید (پایین میسازیم)

// ── محتوای داشبورد — داخل Provider ─────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const { activeCard } = useCard();   // ← cardId از context

  const [loading,            setLoading]            = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]         = useState(1);
  const [categories,         setCategories]         = useState([]);
  const [catLoading,         setCatLoading]         = useState(false);

  const [stats, setStats] = useState({
    summary: {
      cashBalance: 0, totalIncome: 0, totalExpense: 0,
      activeDebt: 0, unpaidInstallmentsCount: 0, unpaidInstallmentsAmount: 0,
    },
    expenseCategories: [],
  });
  const [transactions,  setTransactions]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [initialCurrency, setInitialCurrency] = useState("IRT");

  // ── fetch — وقتی activeCard عوض شد دوباره لود میشه ──────────────────────
  const fetchFinanceData = useCallback(async (page) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/"); return; }
      setLoading(true);

      const cardParam = activeCard ? `&cardId=${activeCard._id}` : "";

      const [statsRes, listRes, notifRes, meRes, categoriesRes] = await Promise.all([
        api.get(`/finance/stats${activeCard ? `?cardId=${activeCard._id}` : ""}`),
        api.get(`/finance/my-data?page=${page}&limit=10${cardParam}`),
        api.get("/notifications"),
        api.get("/auth/me"),
        api.get("/finance/categories"),
      ]);

      setStats(statsRes.data);
      setTransactions(listRes.data.transactions);
      setCurrentPage(listRes.data.currentPage);
      setTotalPages(listRes.data.totalPages);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(notifRes.data.unreadCount);
      setInitialCurrency(meRes.data.user.currency ?? "IRT");
      setCategories(categoriesRes.data.categories ?? categoriesRes.data ?? []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }, [router, activeCard]);   // ← activeCard dep

  // وقتی activeCard عوض شد برگرد صفحه ۱
  useEffect(() => {
    setCurrentPage(1);
    fetchFinanceData(1);
  }, [activeCard]);   // ← هر بار کارت عوض شد ریست

  const fetchNotificationsOnly = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotificationsOnly, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationsOnly]);

  const handleCreateCategory = useCallback(async (label, icon) => {
    setCatLoading(true);
    try {
      const res = await api.post("/finance/categories/custom", { label, icon });
      const newCat = res.data.category ?? res.data;
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "خطا در ساخت دسته‌بندی" };
    } finally {
      setCatLoading(false);
    }
  }, []);

  const handlePageChange    = (page) => fetchFinanceData(page);
  const handleOpenAddModal  = () => { setEditingTransaction(null); setIsModalOpen(true); };
  const handleOpenEditModal = (tx) => { setEditingTransaction(tx); setIsModalOpen(true); };
  const handleCloseModal    = () => { setIsModalOpen(false); setEditingTransaction(null); };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`, {});
      setNotifications((prev) => prev.map((n) => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handlePayInstallment = async (id, cardId = null) => {
    try {
      await api.put(`/finance/pay-installment/${id}`, { cardId });
      fetchFinanceData(currentPage);
    } catch {
      alert("خطا در پرداخت قسط رخ داد.");
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    const msg = transaction.type === "LOAN"
      ? `آیا مطمئنید می‌خواهید وام «${transaction.title}» را حذف کنید؟ تمام اقساط مرتبط هم حذف خواهند شد.`
      : `آیا مطمئنید می‌خواهید تراکنش «${transaction.title}» را حذف کنید؟`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/finance/delete/${transaction._id}`);
      fetchFinanceData(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "خطا در حذف تراکنش رخ داد.");
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); router.push("/"); };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0F6F5C]" size={40} />
      </div>
    );
  }

  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] p-4 sm:p-8 font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
          .font-sans { font-family: 'Vazirmatn', sans-serif; }
          .tabular { font-feature-settings: "tnum"; }
        `}</style>

        <div className="max-w-5xl mx-auto">
          <DashboardHeader
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onLogout={handleLogout}
          />

          <AiAnalysisCard />
          <QuickNav />
          <CurrencyToggle />

          {/* ── بنر کارت فعال ── */}
          <ActiveCardBanner />

          <StatsGrid summary={stats.summary} />

          <TransactionList
            transactions={transactions}
            summary={stats.summary}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPayInstallment={handlePayInstallment}
            onOpenModal={handleOpenAddModal}
            onEditTransaction={handleOpenEditModal}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRefreshData={() => fetchFinanceData(currentPage)}
          editingTransaction={editingTransaction}
          categories={categories}
          onCreateCategory={handleCreateCategory}
          categoryFormLoading={catLoading}
        />
      </div>
    </CurrencyProvider>
  );
}

// ── wrapper — CardProvider بیرونه ────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <CardProvider>
      <DashboardContent />
    </CardProvider>
  );
}
