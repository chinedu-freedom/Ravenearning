"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Layers,
  Wallet
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function MyInvestmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  const { data: invRes, isLoading } = useFetchData("/users/me/investments", ["my-investments"]);
  const investments = invRes?.data || { 
    active: [], 
    completed: [], 
    stats: { total_invested: 0, active_count: 0, est_monthly: 0 } 
  };
  
  const currentList = activeTab === "active" ? investments.active : investments.completed;

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getInvestmentProgress = (startStr, endStr) => {
    if (!startStr || !endStr) return { percent: 0, daysLeft: 0, isMatured: false };
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();
    
    if (now >= end) return { percent: 100, daysLeft: 0, isMatured: true };
    if (now <= start) return { percent: 0, daysLeft: Math.ceil((end - start) / (1000 * 60 * 60 * 24)), isMatured: false };
    
    const total = end - start;
    const elapsed = now - start;
    const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    
    return { percent, daysLeft, isMatured: false };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - White background, Text on left, Plus & Logo on right */}
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
          <h1 className="text-slate-900 text-[19px] sm:text-[21px] font-black tracking-tight leading-tight">
            My Investments
          </h1>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/mining"
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-slate-200/60 shadow-2xs"
            title="Explore Plans"
          >
            <Plus size={16} />
          </Link>
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
        </div>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Summary Stats Cards - Full Width Standard Format */}
        <div className="space-y-3">
          {/* Card 1: Total Invested */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[26px] sm:text-[30px] font-black text-slate-900 tracking-tight leading-none font-mono">
                {currencySymbol}{formatAmount(investments.stats.total_invested)}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-1.5">
                Total Invested Capital
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Wallet size={22} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 2: Active Plans */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[26px] sm:text-[30px] font-black text-emerald-600 tracking-tight leading-none font-mono">
                {investments.stats.active_count}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-1.5">
                Active Investment Plans
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Zap size={22} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: Est. Monthly */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[26px] sm:text-[30px] font-black text-slate-900 tracking-tight leading-none font-mono">
                {currencySymbol}{formatAmount(investments.stats.est_monthly)}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-1.5">
                Estimated 30-Day Return
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Filter Segmented Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`py-2 px-3 rounded-md text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "active"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Active</span>
            <span className="text-[12px] font-semibold opacity-85">({investments.active?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`py-2 px-3 rounded-md text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "completed"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Completed</span>
            <span className="text-[12px] font-semibold opacity-85">({investments.completed?.length || 0})</span>
          </button>
        </div>

        {/* Investment List */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16 gap-3">
            <div className="w-7 h-7 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[12.5px] text-slate-400 font-medium">Loading investments...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center space-y-3 mt-2">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200/70 rounded-full flex items-center justify-center text-slate-400 shadow-2xs">
              <Layers size={26} className="text-slate-400 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-[15px]">
                No {activeTab === "active" ? "Active" : "Completed"} Investments
              </h3>
              <p className="text-[12.5px] text-slate-500 mt-1 max-w-[280px]">
                {activeTab === "active" 
                  ? "You don't have any running investment packages yet. Start earning daily revenue today."
                  : "You haven't completed any investment cycles yet."}
              </p>
            </div>
            {activeTab === "active" && (
              <Link
                href="/dashboard/mining"
                className="bg-[#0f172a] hover:bg-[#021d3c] text-white font-bold px-5 py-2.5 rounded-md text-[13px] shadow-sm transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 mt-1"
              >
                <Sparkles size={14} />
                <span>Explore Investment Plans</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
            <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Product</th>
                    <th className="py-3 px-3.5 text-right">Capital</th>
                    <th className="py-3 px-3.5 text-right">Daily Profit</th>
                    <th className="py-3 px-3.5">Maturity</th>
                    <th className="py-3 px-3.5 text-right">Total Return</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px]">
                  {currentList.map((inv) => {
                    const startDate = inv.created_at || inv.start_date;
                    const endDate = inv.end_date;
                    const { daysLeft } = getInvestmentProgress(startDate, endDate);
                    
                    const dailyInc = Number(inv.daily_profit) || 
                      (inv.plan ? (Number(inv.plan.daily_income) <= 1 ? Number(inv.amount) * Number(inv.plan.daily_income) : Number(inv.plan.daily_income)) : 0);
                    
                    const totalRevenue = inv.plan?.duration 
                      ? (dailyInc * Number(inv.plan.duration)) 
                      : (Number(inv.amount) + dailyInc * 30);

                    const isActive = activeTab === "active";

                    return (
                      <tr 
                        key={inv.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Product Column */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                              {inv.plan?.image ? (
                                <img 
                                  src={inv.plan.image} 
                                  alt={inv.plan.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <Zap size={18} className="text-amber-400 stroke-[2.3]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[13px] font-bold text-slate-900 block truncate">
                                {inv.plan?.name || "Investment Plan"}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                Started: {formatDate(startDate)}{inv.plan?.category ? ` • ${inv.plan.category}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Invested Capital */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                          <span className="font-black text-[13px] font-mono text-slate-900">
                            {currencySymbol}{formatAmount(inv.amount)}
                          </span>
                        </td>

                        {/* Daily Profit */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                          <span className="font-bold text-[13px] font-mono text-emerald-600">
                            +{currencySymbol}{formatAmount(dailyInc)}/d
                          </span>
                        </td>

                        {/* Maturity / Days Left */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {endDate ? (
                            <span className="font-semibold text-[12.5px] font-mono text-slate-700">
                              {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left` : "Completed"}
                            </span>
                          ) : (
                            <span className="text-[12px] text-slate-400">Ongoing</span>
                          )}
                        </td>

                        {/* Total Return */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                          <span className="font-black text-[13px] font-mono text-slate-900">
                            {currencySymbol}{formatAmount(totalRevenue)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Running
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Matured
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
