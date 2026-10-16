"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  ArrowUpRight, 
  Clock, 
  CreditCard, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Landmark,
  Wallet
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function WithdrawalRecordPage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  // Fetch user transactions
  const { data: txRes, isLoading } = useFetchData("/users/transactions", ["user-transactions"]);
  const transactions = txRes?.transactions || txRes?.data || [];

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Filter only withdrawal transactions, sorted by newest first
  const allWithdrawalRecords = useMemo(() => {
    return transactions
      .filter((t) => {
        const type = (t.type || "").toLowerCase();
        return type === "withdraw" || type === "withdrawal";
      })
      .sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0))
      .map((t) => ({
        id: t.id || Math.random().toString(),
        title: "Withdrawal",
        date: formatDate(t.created_at || t.timestamp),
        amount: parseFloat(t.amount) || 0,
        status: (t.status || "pending").toLowerCase(),
        orderId: t.reference || t.id || `WTH-${Date.now()}`,
        walletAddress: t.wallet_address || t.bank_account || t.details?.account_number || t.account_number || null,
        bankName: t.bank_name || t.details?.bank_name || (t.method?.includes("USDT") ? "USDT" : "Bank Transfer"),
      }));
  }, [transactions]);

  // Show latest 15 records
  const withdrawalRecords = useMemo(() => {
    return allWithdrawalRecords.slice(0, 15);
  }, [allWithdrawalRecords]);

  const totalAmount = useMemo(() => {
    return allWithdrawalRecords.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [allWithdrawalRecords]);

  const getStatusBadge = (status) => {
    if (status === "completed" || status === "success" || status === "approved") {
      return {
        text: "SUCCESS",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: CheckCircle2,
      };
    }
    if (status === "pending" || status === "processing") {
      return {
        text: "PENDING",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        icon: AlertCircle,
      };
    }
    return {
      text: "FAILED",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      icon: XCircle,
    };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start">
      
      {/* Top Header Bar - White background, Text on left, Logo on right */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Withdrawal Record
          </h1>
        </div>
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
        </div>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Stats Card - Exactly matching the reference image */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[28px] sm:text-[32px] font-black text-emerald-600 tracking-tight leading-none font-mono">
              {allWithdrawalRecords.length}
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">
              Total Withdrawals
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <ArrowUpRight size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Responsive Horizontal-Scrolling Table Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-slate-900 text-[15px] font-bold tracking-tight">
              History
            </h2>
            {allWithdrawalRecords.length > 15 && (
              <span className="text-[11.5px] text-slate-400 font-medium">
                Showing latest 15 records
              </span>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f172a] mb-2" />
                <span className="text-[12px] text-slate-500 font-medium">
                  Loading withdrawal records...
                </span>
              </div>
            ) : withdrawalRecords.length > 0 ? (
              <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left border-collapse min-w-[520px]">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3.5">Date & Time</th>
                      <th className="py-3 px-3.5">Destination</th>
                      <th className="py-3 px-3.5 text-right">Amount</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5">Order ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {withdrawalRecords.map((item) => {
                      const badge = getStatusBadge(item.status);
                      const StatusIcon = badge.icon;

                      return (
                        <tr 
                          key={item.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Date & Time */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 font-medium text-[12px]">
                            {item.date}
                          </td>

                          {/* Destination */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {item.bankName?.toLowerCase().includes("usdt") ? (
                                <Wallet size={13} className="text-slate-400 shrink-0" />
                              ) : (
                                <Landmark size={13} className="text-slate-400 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-900 text-[12.5px]">
                                {item.bankName || "Bank"}
                              </span>
                            </div>
                            {item.walletAddress && (
                              <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[140px] mt-0.5">
                                {item.walletAddress}
                              </span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                            <span className="font-black text-[13.5px] text-slate-900 font-mono">
                              {currencySymbol} {formatAmount(item.amount)}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10.5px] font-bold ${badge.badgeClass}`}
                            >
                              <StatusIcon size={11} className="shrink-0" />
                              <span>{badge.text}</span>
                            </span>
                          </td>

                          {/* Order ID */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {item.orderId}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                  <CreditCard size={22} />
                </div>
                <p className="text-slate-700 text-[14px] font-bold">
                  No records yet
                </p>
                <p className="text-slate-400 text-[12px] mt-1 mb-4">
                  You haven&apos;t submitted any withdrawal requests yet.
                </p>
                <Link
                  href="/dashboard/wallet/withdraw"
                  className="bg-[#0f172a] hover:bg-[#021d3c] text-white text-[12px] font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Make a Withdrawal
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
