"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  Plus,
  Minus,
  TrendingUp,
  History
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function BalancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "income"

  // Fetch settings & current balance
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  const { data: userRes } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const currentBalance = user?.balance || user?.wallet_balance || 0;

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

  const cleanTransactions = useMemo(() => {
    return transactions.map((t) => {
      const type = (t.type || "").toLowerCase();
      const status = (t.status || "").toLowerCase();
      
      const isCredit = 
        type === "deposit" || 
        type === "recharge" || 
        type === "commission" || 
        type === "referral_bonus" || 
        type === "daily_checkin" || 
        type === "treasure_reward" || 
        type === "gift_code" ||
        type === "mining_yield" ||
        type === "yield" ||
        type === "bonus" ||
        type === "income";

      const titleMap = {
        deposit: "Recharge success",
        recharge: "Recharge success",
        withdraw: "Withdrawal",
        withdrawal: "Withdrawal",
        daily_checkin: "Daily check-in reward",
        commission: "Team commission income",
        referral_bonus: "Referral reward",
        treasure_reward: "Gift code redeemed",
        gift_code: "Gift code redeemed",
        mining_yield: "Machine income",
        yield: "Machine income",
        buy_machine: "Purchase mining machine",
      };

      const title = titleMap[type] || t.description || (isCredit ? "Income record" : "Expense record");

      return {
        id: t.id || Math.random().toString(),
        title,
        date: formatDate(t.created_at || t.timestamp),
        amount: `${currencySymbol}${formatAmount(t.amount)}`,
        isCredit,
        rawAmount: parseFloat(t.amount) || 0,
        type,
        status
      };
    });
  }, [transactions, currencySymbol]);

  const incomeTransactions = useMemo(() => {
    return cleanTransactions.filter((t) => t.isCredit);
  }, [cleanTransactions]);

  const displayedTransactions = activeTab === "all" ? cleanTransactions : incomeTransactions;

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
          Balance Record
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Balance Hero Card - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-3">
            ACCOUNT LEDGER
          </div>

          <div className="mb-4">
            <p className="text-sky-100 text-[12px] font-medium mb-1">
              Current Balance
            </p>
            <h2 className="text-[30px] font-black text-white tracking-tight leading-none">
              {currencySymbol}{formatAmount(currentBalance)}
            </h2>
          </div>

          {/* Stats Panels */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3">
              <div className="text-[18px] font-bold text-white leading-tight">
                {displayedTransactions.length}
              </div>
              <div className="text-sky-100 text-[11px] font-medium mt-0.5">
                All records
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3">
              <div className="text-[18px] font-bold text-white leading-tight">
                {incomeTransactions.length}
              </div>
              <div className="text-sky-100 text-[11px] font-medium mt-0.5">
                Income rows
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#111827] border border-white/5 p-1 rounded-xl grid grid-cols-2 gap-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer text-center ${
              activeTab === "all"
                ? "bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer text-center ${
              activeTab === "income"
                ? "bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Income
          </button>
        </div>

        {/* Transactions Timeline */}
        <div className="mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0284c7] mb-2" />
              <span className="text-[12px] text-gray-500 font-medium">
                Loading records...
              </span>
            </div>
          ) : displayedTransactions.length > 0 ? (
            <div className="relative pl-6 space-y-3">
              {/* Timeline vertical bar */}
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-white/10" />

              {displayedTransactions.map((tx) => (
                <div key={tx.id} className="relative flex items-center gap-3">
                  
                  {/* Timeline node icon */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-black z-10 ${
                      tx.isCredit
                        ? "bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40 shadow-[0_0_10px_rgba(2,132,199,0.3)]"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                    {tx.isCredit ? <Plus size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
                  </div>

                  {/* Record Entry Card */}
                  <div className="flex-1 bg-[#111827] border border-white/5 rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:border-white/10 transition-all">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-white/95 text-[13.5px] font-bold leading-snug truncate">
                        {tx.title}
                      </h4>
                      <p className="text-gray-400 text-[11px] font-medium mt-0.5">
                        {tx.date}
                      </p>
                    </div>

                    <div
                      className={`text-[14px] font-extrabold whitespace-nowrap ${
                        tx.isCredit ? "text-[#38bdf8]" : "text-red-400"
                      }`}
                    >
                      {tx.isCredit ? `+ ${tx.amount}` : `- ${tx.amount}`}
                    </div>
                  </div>

                </div>
              ))}

              <div className="text-center pt-4 pb-2 text-[12px] text-gray-500 font-medium">
                No more records !
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] rounded-[18px] border border-white/5 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 mb-3">
                <FileText size={22} />
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
