"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Inbox,
  Loader2
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function TransactionsPage() {
  const router = useRouter();

  const { data: txRes, isLoading } = useFetchData("/users/transactions", ["transactions"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";
  const rawTransactions = txRes?.transactions || [];

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getTransactionTypeInfo = (type, description) => {
    const t = (type || "").toLowerCase();
    const d = (description || "").toLowerCase();

    if (
      d.includes("deposit") ||
      t.includes("deposit") ||
      t.includes("admin_credit") ||
      d.includes("manual credit") ||
      d.includes("quick pay") ||
      d.includes("gateway")
    ) {
      return {
        label: "Deposit",
        description: description || "Recharge Deposit",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80"
      };
    }

    if (
      d.includes("withdraw") ||
      t.includes("withdraw") ||
      t.includes("admin_debit") ||
      d.includes("manual debit")
    ) {
      return {
        label: "Withdrawal",
        description: description || "Account Withdrawal",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80"
      };
    }

    if (t.includes("commission") || t.includes("referral") || d.includes("commission")) {
      return {
        label: "Commission",
        description: description || "Referral Commission",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80"
      };
    }

    if (t.includes("spin") || d.includes("spin")) {
      return {
        label: "Lucky Spin",
        description: description || "Lucky Spin Prize",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80"
      };
    }

    if (t.includes("checkin") || d.includes("check-in") || d.includes("checkin")) {
      return {
        label: "Check-in",
        description: description || "Daily Check-in Reward",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80"
      };
    }

    if (t.includes("task") || d.includes("task")) {
      return {
        label: "Task",
        description: description || "Task Mission Reward",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80"
      };
    }

    if (t.includes("invest") || t.includes("plan") || d.includes("invest")) {
      return {
        label: "Investment",
        description: description || "Plan Investment",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
      };
    }

    if (t.includes("reward") || t.includes("bonus") || d.includes("bonus") || d.includes("welcome")) {
      return {
        label: "Bonus",
        description: description || "Reward Bonus",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80"
      };
    }

    return {
      label: type ? type.toUpperCase() : "Transaction",
      description: description || type || "Transaction Record",
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200"
    };
  };

  const getStatusBadge = (status) => {
    const s = (status || "SUCCESS").toLowerCase();
    if (s === "completed" || s === "success" || s === "approved") {
      return {
        text: "SUCCESS",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: CheckCircle2,
      };
    }
    if (s === "pending" || s === "processing") {
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

  const transactions = useMemo(() => {
    return rawTransactions
      .slice()
      .sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0))
      .map((tx) => {
        const typeInfo = getTransactionTypeInfo(tx.type, tx.description);
        const typeLower = (tx.type || "").toLowerCase();
        const descLower = (tx.description || "").toLowerCase();

        let isCredit = false;
        if (
          typeLower.includes("deposit") ||
          typeLower.includes("reward") ||
          typeLower.includes("bonus") ||
          typeLower.includes("gift") ||
          typeLower.includes("checkin") ||
          typeLower.includes("check-in") ||
          typeLower.includes("credit") ||
          typeLower.includes("commission") ||
          typeLower.includes("referral") ||
          typeLower.includes("migration") ||
          typeLower.includes("profit") ||
          typeLower.includes("payout") ||
          typeLower.includes("refund") ||
          descLower.includes("bonus") ||
          descLower.includes("welcome") ||
          descLower.includes("reward") ||
          descLower.includes("gift") ||
          descLower.includes("refund") ||
          descLower.includes("payout") ||
          descLower.includes("profit") ||
          descLower.includes("commission")
        ) {
          isCredit = true;
        } else if (
          typeLower.includes("debit") ||
          typeLower.includes("cost") ||
          typeLower.includes("withdraw") ||
          typeLower.includes("invest") ||
          typeLower.includes("plan") ||
          descLower.includes("withdraw") ||
          descLower.includes("invest")
        ) {
          isCredit = false;
        } else if (
          tx.balance_before !== undefined &&
          tx.balance_after !== undefined &&
          tx.balance_before !== null &&
          tx.balance_after !== null
        ) {
          const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
          if (diff !== 0) {
            isCredit = diff > 0;
          }
        }

        const amountVal = Math.abs(parseFloat(tx.amount) || 0);
        const descText = (tx.description && tx.description.trim()) ? tx.description : typeInfo.description;

        return {
          id: tx.id || Math.random().toString(),
          description: descText,
          typeLabel: typeInfo.label,
          typeBadgeClass: typeInfo.badgeClass,
          date: formatDate(tx.created_at),
          rawDate: tx.created_at,
          amountVal,
          isCredit,
          amountStr: `${isCredit ? "+" : "-"} ${currencySymbol} ${formatAmount(amountVal)}`,
          status: tx.status || "SUCCESS",
          wallet_address: tx.wallet_address || "",
          orderId: tx.reference || tx.order_id || tx.id || `TXN-${Date.now()}`
        };
      });
  }, [rawTransactions, currencySymbol]);

  // Total inflow calculation
  const totalInflow = useMemo(() => {
    return rawTransactions.reduce((acc, tx) => {
      const status = (tx.status || "SUCCESS").toUpperCase();
      if (status !== "SUCCESS" && status !== "APPROVED" && status !== "COMPLETED") {
        return acc;
      }

      const typeLower = (tx.type || "").toLowerCase();
      const descLower = (tx.description || "").toLowerCase();

      let isCredit = false;
      if (
        typeLower.includes("deposit") ||
        typeLower.includes("reward") ||
        typeLower.includes("bonus") ||
        typeLower.includes("gift") ||
        typeLower.includes("checkin") ||
        typeLower.includes("check-in") ||
        typeLower.includes("credit") ||
        typeLower.includes("commission") ||
        typeLower.includes("referral") ||
        typeLower.includes("migration") ||
        typeLower.includes("profit") ||
        typeLower.includes("payout") ||
        typeLower.includes("refund") ||
        descLower.includes("refund") ||
        descLower.includes("payout") ||
        descLower.includes("profit")
      ) {
        isCredit = true;
      } else if (
        tx.balance_before !== undefined &&
        tx.balance_after !== undefined &&
        tx.balance_before !== null &&
        tx.balance_after !== null
      ) {
        const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
        if (diff !== 0) {
          isCredit = diff > 0;
        }
      }

      if (!isCredit) return acc;

      const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
      const amountVal = parseFloat(tx.amount) || 0;
      const addedAmount = diff > 0 ? diff : amountVal;

      return acc + addedAmount;
    }, 0);
  }, [rawTransactions]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
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
            Transactions
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
        
        {/* Stats Card - Exactly matching our standard stats card format */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[28px] sm:text-[32px] font-black text-emerald-600 tracking-tight leading-none font-mono">
              {currencySymbol}{formatAmount(totalInflow)}
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">
              Total Inflow ({transactions.length} records)
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
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f172a] mb-2" />
                <span className="text-[12px] text-slate-500 font-medium">
                  Loading transactions...
                </span>
              </div>
            ) : transactions.length > 0 ? (
              <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left border-collapse min-w-[540px]">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3.5">Date & Time</th>
                      <th className="py-3 px-3.5">Type</th>
                      <th className="py-3 px-3.5">Description</th>
                      <th className="py-3 px-3.5 text-right">Amount</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {transactions.map((item) => {
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

                          {/* Type */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${item.typeBadgeClass}`}
                            >
                              {item.typeLabel}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <span className="text-[12.5px] font-semibold text-slate-800 block truncate max-w-[220px]" title={item.description}>
                              {item.description}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                            <span
                              className={`font-black text-[13.5px] font-mono ${
                                item.isCredit ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {item.amountStr}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                  <Inbox size={22} />
                </div>
                <p className="text-slate-700 text-[14px] font-bold">
                  No records yet
                </p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Your transaction history will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
