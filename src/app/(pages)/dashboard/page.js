"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TransactionList from "@/components/dashboard/TransactionList";
import TransactionModal from "@/components/dashboard/TransactionModal";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // null = حالت افزودن، شیء تراکنش = حالت ویرایش
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    summary: { cashBalance: 0, totalIncome: 0, totalExpense: 0, activeDebt: 0, unpaidInstallmentsCount: 0, unpaidInstallmentsAmount: 0 },
    expenseCategories: []
  });
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ⭐ حالا این تابع تنها نقطه‌ی ورودی برای فچ کردن داده‌هاست.
  // دیگه هیچ useEffect ای روی currentPage گوش نمی‌ده، پس امکان دابل-فچ از بین می‌ره.
  const fetchFinanceData = useCallback(async (page) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      setLoading(true);
      const [statsRes, listRes, notifRes] = await Promise.all([
        api.get("/finance/stats"),
        api.get(`/finance/my-data?page=${page}&limit=10`),
        api.get("/notifications")
      ]);

      setStats(statsRes.data);
      setTransactions(listRes.data.transactions);
      setCurrentPage(listRes.data.currentPage);
      setTotalPages(listRes.data.totalPages);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(notifRes.data.unreadCount);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // فقط یک بار موقع mount اجرا می‌شه
  useEffect(() => {
    fetchFinanceData(1);
  }, [fetchFinanceData]);

  // ⭐ صفحه‌بندی حالا خودش صراحتاً فچ می‌زنه، نه از طریق useEffect
  const handlePageChange = (page) => {
    fetchFinanceData(page);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`, {});
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handlePayInstallment = async (id) => {
    try {
      await api.put(`/finance/pay-installment/${id}`, {});
      fetchFinanceData(currentPage);
    } catch (error) {
      console.error("Error paying installment:", error);
      alert("خطا در پرداخت قسط رخ داد.");
    }
  };

  // باز کردن مودال برای افزودن تراکنش جدید
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // باز کردن مودال برای ویرایش یک تراکنش موجود
  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // حذف تراکنش با گرفتن تأیید از کاربر
  const handleDeleteTransaction = async (transaction) => {
    const confirmMessage = transaction.type === 'LOAN'
      ? `آیا مطمئنید می‌خواهید وام «${transaction.title}» را حذف کنید؟ تمام اقساط مرتبط با این وام هم حذف خواهند شد.`
      : `آیا مطمئنید می‌خواهید تراکنش «${transaction.title}» را حذف کنید؟`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await api.delete(`/finance/delete/${transaction._id}`);
      fetchFinanceData(currentPage);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert(error.response?.data?.message || "خطا در حذف تراکنش رخ داد.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-[#0F6F5C]" size={40} />
      </div>
    );
  }

  return (
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
      />
    </div>
  );
}
