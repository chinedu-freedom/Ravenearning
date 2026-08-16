"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Clock, 
  CreditCard, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function WithdrawalRecordPage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  // Fetch transactions
  const { data: txRes, isLoading } = useFetchData("/transactions", ["transactions"]);
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

  // Filter only withdrawal transactions
  const withdrawalRecords = useMemo(() => {
    return transactions
      .filter((t) => {
        const type = (t.type || "").toLowerCase();
        return type === "withdraw" || type === "withdrawal";
      })
      .map((t) => ({
        id: t.id || Math.random().toString(),
        title: "Withdrawal",
        date: formatDate(t.created_at || t.timestamp),
        amount: parseFloat(t.amount) || 0,
        status: (t.status || "pending").toLowerCase(),
        orderId: t.reference || t.id || `WTH-${Date.now()}`,
        walletAddress: t.wallet_address || t.bank_account || t.details?.account_number || null,
      }));
  }, [transactions]);

  const getStatusBadge = (status) => {
    if (status === "completed" || status === "success" || status === "approved") {
      return {
        text: "SUCCESS",
        bg: "bg-[#0284c7]/10 text-[#38bdf8] border-[#0284c7]/30",
        icon: CheckCircle2,
      };
    }
    if (status === "pending" || status === "processing") {
      return {
        text: "PENDING",
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        icon: AlertCircle,
      };
    }
    return {
      text: "FAILED",
      bg: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: XCircle,
    };
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24 select-none">
      
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard/account")}
          className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">
          Withdrawal Record
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Top Hero Card - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-2.5">
            WITHDRAWAL LOG
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            Withdrawal Record
          </h2>
          <p className="text-sky-100 text-[12px] leading-relaxed mb-3">
            Review transfer requests, arrival amount, and processing state.
          </p>

          {/* Stats Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl">
            <span className="text-white font-black text-[14px]">
              {withdrawalRecords.length}
            </span>
            <span className="text-sky-100 text-[11px] font-medium">
              Total records
            </span>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0284c7] mb-2" />
              <span className="text-[12px] text-gray-500 font-medium">
                Loading records...
              </span>
            </div>
          ) : withdrawalRecords.length > 0 ? (
            withdrawalRecords.map((item) => {
              const badge = getStatusBadge(item.status);
              const StatusIcon = badge.icon;

              return (
                <div
                  key={item.id}
                  className="bg-[#111827] border border-white/5 rounded-[18px] p-4 shadow-sm space-y-3 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-900/20 border border-white/5 flex items-center justify-center text-red-400">
                        <ArrowUpRight size={16} />
                      </div>
                      <div>
                        <h4 className="text-white/95 text-[14px] font-bold leading-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-gray-400 text-[10.5px] mt-0.5">
                          <Clock size={11} />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-red-400 text-[16px] font-black tracking-tight">
                        - {currencySymbol}{formatAmount(item.amount)}
                      </div>
                    </div>
                  </div>

                  {item.walletAddress && (
                    <div className="text-[11px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-md truncate">
                      Destination: {item.walletAddress}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Order Status</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider ${badge.bg}`}
                    >
                      <StatusIcon size={11} />
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#111827] rounded-[18px] border border-white/5 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 mb-3">
                <CreditCard size={22} />
              </div>
              <p className="text-gray-400 text-[13px] font-medium">
                No record yet !
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
