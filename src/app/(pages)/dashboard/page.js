"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

// کامپوننت‌های تفکیک شده
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TransactionList from "@/components/dashboard/TransactionList";
import TransactionModal from "@/components/dashboard/TransactionModal";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // استیت‌های داده
  const [stats, setStats] = useState({
    summary: { cashBalance: 0, totalIncome: 0, totalExpense: 0, activeDebt: 0, unpaidInstallmentsCount: 0, unpaidInstallmentsAmount: 0 },
    expenseCategories: []
  });
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // دریافت جامع داده‌ها از بک‌اندایند
  const fetchFinanceData = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      setLoading(true);
      const [statsRes, listRes, notifRes] = await Promise.all([
        api.get("/finance/stats", { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/finance/my-data?page=${page}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/notifications", { headers: { Authorization: `Bearer ${token}` } })
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
  };

  useEffect(() => {
    fetchFinanceData(currentPage);
  }, [currentPage]);

  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/notifications/${notifId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handlePayInstallment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/finance/pay-installment/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchFinanceData(currentPage);
    } catch (error) {
      console.error("Error paying installment:", error);
      alert("خطا در پرداخت قسط رخ داد.");
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
          onPageChange={setCurrentPage} 
          onPayInstallment={handlePayInstallment} 
          onOpenModal={() => setIsModalOpen(true)} 
        />
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefreshData={() => {
          setCurrentPage(1);
          fetchFinanceData(1);
        }} 
      />
    </div>
  );
}