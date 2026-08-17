"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, X, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/useApi";
import { postData } from "@/config/apiHelpers";
import { toast } from "sonner";

export default function MiningPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const { data: plansRes, isLoading } = useFetchData("/plans", ["plans"]);
  const { data: userRes } = useFetchData("/users/me", ["user"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  
  const plans = Array.isArray(plansRes?.data) 
    ? [...plansRes.data].sort((a, b) => Number(a.min_investment || 0) - Number(b.min_investment || 0))
    : [];
  const router = useRouter();

  const balances = {
    main: Number(userRes?.user?.balance || 0) + Number(userRes?.user?.withdrawable_balance || 0)
  };

  const [isInvesting, setIsInvesting] = useState(false);

  const handleInvest = async () => {
    if (!selectedPlan || !investmentAmount) {
      toast.error("Please enter an investment amount");
      return;
    }
    
    setIsInvesting(true);
    try {
      const data = await postData('/plans/invest', {
        planId: selectedPlan.id,
        amount: parseFloat(investmentAmount),
        source: "main"
      });
      
      if (data?.success) {
        toast.success(data.message || "Package activated successfully! Your investment is now running.");
        setSelectedPlan(null);
        setInvestmentAmount("");
        setTimeout(() => {
          router.push("/dashboard/investments");
        }, 1500);
      } else {
        toast.error(data.error || "Investment failed");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsInvesting(false);
    }
  };

  const handleMineClick = (plan) => {
    setSelectedPlan(plan);
    setInvestmentAmount(String(plan.min_investment || ""));
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Calculations
  const amount = parseFloat(investmentAmount) || (selectedPlan ? Number(selectedPlan.min_investment) : 0);
  const dailyIncome = selectedPlan ? (amount * Number(selectedPlan.daily_income)) / 100 : 0;
  const totalReturn = selectedPlan ? (dailyIncome * selectedPlan.duration) : 0;

  // Format currency helper
  const formatCurrency = (val) => {
    const symbol = settings.currency_symbol || "R";
    return `${symbol} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const defaultPlanImage = "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="flex flex-col h-full bg-[#f0f4f8] overflow-y-auto [&::-webkit-scrollbar]:hidden relative select-none">
      {/* Page Title Header */}
      <div className="px-5 pt-4 pb-1 flex justify-between items-center max-w-[480px] mx-auto w-full">
        <div>
          <h1 className="text-slate-900 text-[22px] font-black tracking-tight leading-tight">
            VIP Packages
          </h1>
          <p className="text-slate-500 text-[12.5px] font-medium mt-0.5">
            Select a Raven projector package
          </p>
        </div>
        <Link href="/dashboard/investments" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200/80 shadow-xs">
          <Wallet size={16} />
        </Link>
      </div>

      {/* Plans List */}
      <div className="px-4 pt-2 pb-24 space-y-4 max-w-[480px] mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#4f8cff]" />
            <p className="text-xs font-bold">Loading packages...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm font-bold">No packages available.</p>
          </div>
        ) : plans.map((plan, index) => {
          const minInv = Number(plan.min_investment || 0);
          const dailyInc = (minInv * Number(plan.daily_income || 0)) / 100;
          const totalInc = dailyInc * Number(plan.duration || 0);

          return (
            <div key={plan.id} className="bg-white rounded-[18px] p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              
              {/* Upper Section: Flex Image + Details */}
              <div className="flex items-start gap-4">
                {/* Left Product Image */}
                <div className="w-[125px] h-[115px] rounded-[14px] overflow-hidden shrink-0 border border-slate-100 bg-slate-50 shadow-xs relative">
                  <img
                    src={plan.image || defaultPlanImage}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] tracking-wider uppercase shadow-xs">
                    VIP{index + 1}
                  </div>
                </div>

                {/* Right Details Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[115px]">
                  <div>
                    <h2 className="text-slate-900 font-extrabold text-[16px] tracking-tight leading-snug truncate">
                      {plan.name}
                    </h2>
                    <p className="text-[#2563eb] font-black text-[16px] mt-1 leading-none">
                      {formatCurrency(minInv)}
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Duration:</span>
                      <span className="text-slate-800 font-bold">{plan.duration}-DAYS</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Daily Income:</span>
                      <span className="text-emerald-600 font-black">{formatCurrency(dailyInc)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Total Revenue:</span>
                      <span className="text-slate-900 font-black">{formatCurrency(totalInc)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width BUY NOW Pill Button */}
              <button
                onClick={() => handleMineClick(plan)}
                className="w-full bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] hover:opacity-95 text-white font-extrabold py-3 rounded-full transition-all text-[13.5px] shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>ACTIVATE PACKAGE</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={closeModal} />

          <div className="relative bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Top Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                  <img src={selectedPlan.image || defaultPlanImage} alt={selectedPlan.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight">{selectedPlan.name}</h3>
                  <p className="text-slate-500 text-[11px] font-medium mt-0.5">{selectedPlan.duration} days ? {Number(selectedPlan.daily_income).toFixed(1)}% daily</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:hidden">

              <div className="flex justify-between items-center py-3.5 bg-slate-50 rounded-2xl border border-slate-100 px-4">
                <div className="text-center w-1/3">
                  <div className="text-[#4f8cff] font-extrabold text-[15px]">{Number(selectedPlan.daily_income).toFixed(1)}%</div>
                  <div className="text-slate-400 text-[10px] font-semibold mt-0.5 uppercase">Daily Rate</div>
                </div>
                <div className="text-center w-1/3 border-x border-slate-200/80">
                  <div className="text-slate-800 font-extrabold text-[15px]">{selectedPlan.duration} days</div>
                  <div className="text-slate-400 text-[10px] font-semibold mt-0.5 uppercase">Term</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-slate-900 font-extrabold text-[15px]">{(Number(selectedPlan.daily_income) * selectedPlan.duration).toFixed(0)}%</div>
                  <div className="text-slate-400 text-[10px] font-semibold mt-0.5 uppercase">Total Yield</div>
                </div>
              </div>

              {/* Available Balance */}
              <div>
                <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Available Balance</label>
                <div className="w-full py-3.5 rounded-2xl border border-sky-100 bg-sky-50/50 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">Wallet Balance</span>
                  <span className="text-[20px] text-slate-900 font-black">{formatCurrency(balances.main)}</span>
                </div>
              </div>

              {/* Investment Amount */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-slate-700 text-[12px] font-bold">Package Price</label>
                  <span className="text-slate-400 text-[10px] font-medium">Required: {formatCurrency(Number(selectedPlan.min_investment))}</span>
                </div>
                <input
                  type="number"
                  value={investmentAmount}
                  readOnly
                  className="w-full border border-slate-200 bg-slate-100/70 rounded-xl px-4 py-3 text-[16px] font-black text-slate-900 focus:outline-none transition-all cursor-not-allowed"
                />
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500 text-[12px] font-medium">Daily Income</span>
                  <span className="text-emerald-600 text-[15px] font-extrabold">{formatCurrency(dailyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-500 text-[12px] font-medium">Total Expected Revenue</span>
                  <span className="text-[#2563eb] text-[15px] font-black">{formatCurrency(totalReturn)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex flex-col items-center gap-3">
              <button 
                onClick={handleInvest}
                disabled={isInvesting}
                className="w-full bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] hover:opacity-95 text-white font-extrabold py-3.5 rounded-full transition-all text-[15px] shadow-sm disabled:opacity-50 flex items-center justify-center cursor-pointer uppercase tracking-wider active:scale-[0.99]"
              >
                {isInvesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRM ACTIVATION"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
