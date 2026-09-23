"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { CurrencyProvider } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext"; // فقط useCard — نه CardProvider
import DashboardHeader  from "@/components/dashboard/DashboardHeader";
import StatsGrid        from "@/components/dashboard/StatsGrid";
import TransactionList  from "@/components/dashboard/TransactionList";
import TransactionModal from "@/components/dashboard/TransactionModal";
import AiAnalysisCard   from "@/components/dashboard/AiAnalysisCard";
import CurrencyToggle   from "@/components/dashboard/CurrencyToggle";
import QuickNav         from "@/components/dashboard/QuickNav";
import ActiveCardBanner from "@/components/dashboard/ActiveCardBanner";

export default function DashboardPage() {
  const router = useRouter();
  const { activeCard } = useCard(); // از layout's CardProvider

  const [loading,            setLoading]            = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]         = useState(1);
  const [categories,         setCategories]         = useState([]);
  const [catLoading,         setCatLoading]         = useState(false);
  const [initialCurrency,    setInitialCurrency]    = useState("IRT");
  const [notifications,      setNotifications]      = useState([]);
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [stats, setStats] = useState({
    summary: {
      cashBalance: 0, totalIncome: 0, totalExpense: 0,
      activeDebt: 0, unpaidInstallmentsCount: 0, unpaidInstallmentsAmount: 0,
    },
    expenseCategories: [],
  });
  const [transactions, setTransactions] = useState([]);

  const fetchFinanceData = useCallback(async (page) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/"); return; }
      setLoading(true);

      const cardParam = activeCard ? `?cardId=${activeCard._id}` : "";
      const cardQuery = activeCard ? `&cardId=${activeCard._id}` : "";

      const [statsRes, listRes, notifRes, meRes, categoriesRes] = await Promise.all([
        api.get(`/finance/stats${cardParam}`),
        api.get(`/finance/my-data?page=${page}&limit=10${cardQuery}`),
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
  }, [router, activeCard]);

  // هر بار activeCard عوض شد → صفحه ۱ و fetch مجدد
  useEffect(() => {
    setCurrentPage(1);
    fetchFinanceData(1);
  }, [activeCard]); // eslint-disable-line

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCategory = useCallback(async (label, icon) => {
    setCatLoading(true);
    try {
      const res = await api.post("/finance/categories/custom", { label, icon });
      const newCat = res.data.category ?? res.data;
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "خطا" };
    } finally {
      setCatLoading(false);
    }
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handlePayInstallment = async (id) => {
    try {
      await api.put(`/finance/pay-installment/${id}`, {});
      fetchFinanceData(currentPage);
    } catch { alert("خطا در پرداخت قسط"); }
  };

  const handleDeleteTransaction = async (tx) => {
    const msg = tx.type === "LOAN"
      ? `آیا مطمئنید می‌خواهید وام «${tx.title}» را حذف کنید؟`
      : `آیا مطمئنید می‌خواهید تراکنش «${tx.title}» را حذف کنید؟`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/finance/delete/${tx._id}`);
      fetchFinanceData(currentPage);
    } catch (err) { alert(err.response?.data?.message || "خطا در حذف"); }
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
        `}</style>
        <div className="max-w-5xl mx-auto">
          <DashboardHeader
            notifications={notifications} unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead} onLogout={handleLogout}
          />
          <AiAnalysisCard />
          <QuickNav />
          <CurrencyToggle />
          <ActiveCardBanner />
          <StatsGrid summary={stats.summary} />
          <TransactionList
            transactions={transactions}
            summary={stats.summary}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchFinanceData(page)}
            onPayInstallment={handlePayInstallment}
            onOpenModal={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            onEditTransaction={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
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
