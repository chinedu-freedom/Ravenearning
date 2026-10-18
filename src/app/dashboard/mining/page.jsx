"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { postData } from "@/config/apiHelpers";
import { toast } from "sonner";

export default function MiningPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const { data: plansRes, isLoading } = useFetchData("/plans", ["plans"]);
  const { data: userRes } = useFetchData("/users/me", ["user"]);
  const { data: invRes } = useFetchData("/users/me/investments", ["my-investments"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  
  const isActivityEnabled = Boolean(settings?.activity_series_enabled);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const defaultCategory = isActivityEnabled ? "Activity Series" : "VIP Series";
  const activeCategory = selectedCategory || defaultCategory;

  const plans = Array.isArray(plansRes?.data) 
    ? [...plansRes.data].sort((a, b) => Number(a.min_investment || 0) - Number(b.min_investment || 0))
    : [];
  const router = useRouter();
  const queryClient = useQueryClient();

  const productCount = (invRes?.data?.active?.length ?? 0) + (invRes?.data?.completed?.length ?? 0);
  const totalRevenue = userRes?.user?.cumulative_income != null 
    ? Number(userRes.user.cumulative_income) 
    : Number(userRes?.user?.total_income || 0);
  const currencySymbol = settings.currency_symbol || "R";

  const formatRevenue = (val) => {
    return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const rawCategories = Array.from(new Set(
    plans
      .map(p => p.category || "VIP Series")
      .filter(cat => cat !== "Activity Series" || isActivityEnabled)
  ));

  const categories = [];
  if (isActivityEnabled) {
    categories.push("Activity Series");
  }
  categories.push("VIP Series");

  rawCategories.forEach(cat => {
    if (!categories.includes(cat)) {
      categories.push(cat);
    }
  });

  const filteredPlans = plans.filter(p => (p.category || "VIP Series") === activeCategory);

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
        queryClient.invalidateQueries({ queryKey: ["my-investments"] });
        queryClient.refetchQueries({ queryKey: ["my-investments"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });

        toast.success(data.message || "Product purchased successfully! Your investment is now running.");
        setSelectedPlan(null);
        setInvestmentAmount("");
        setTimeout(() => {
          router.push("/dashboard/investments");
        }, 1000);
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
  const rawDailyInc = selectedPlan ? Number(selectedPlan.daily_income || 0) : 0;
  const unitDailyInc = selectedPlan 
    ? (rawDailyInc <= 1 ? Number(selectedPlan.min_investment || 0) * rawDailyInc : rawDailyInc) 
    : 0;
  const quantity = selectedPlan && Number(selectedPlan.min_investment) > 0 
    ? Math.max(1, Math.round(amount / Number(selectedPlan.min_investment))) 
    : 1;

  const dailyIncome = unitDailyInc * quantity;
  const totalReturn = selectedPlan 
    ? (selectedPlan.total_revenue ? Number(selectedPlan.total_revenue) * quantity : dailyIncome * Number(selectedPlan.duration || 0)) 
    : 0;

  // Format currency helper
  const formatCurrency = (val) => {
    const symbol = settings.currency_symbol || "R";
    return `${symbol} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Distinct sun image perspectives, designs, and colors for each package
  const getPlanImage = (plan, idx) => {
    if (plan?.image && plan.image !== "/logo.png" && !plan.image.includes("logo.png")) {
      return plan.image;
    }
    
    // Category check for activity plans
    if (plan?.category?.toLowerCase().includes("activity")) {
      const actIdx = (idx ?? 0) % 2;
      return actIdx === 0 ? "/images/plans/activity1.jpg" : "/images/plans/activity2.jpg";
    }

    // VIP plans 1 through 8 with distinct perspectives, designs, and colors of the sun
    const vipImages = [
      "/images/plans/vip1.jpg", // Amber Gold Sun (Warm Sunrise)
      "/images/plans/vip2.jpg", // Emerald Crystalline Sun (Isometric Crystal)
      "/images/plans/vip3.jpg", // Royal Sapphire Cobalt Sun (Deep Blue Chrome)
      "/images/plans/vip4.jpg", // Cosmic Amethyst Violet Sun (Neon Purple Corona)
      "/images/plans/vip5.jpg", // Fiery Crimson Ruby Sun (Blazing Red Solar Flare)
      "/images/plans/vip6.jpg", // Electric Cyan Turquoise Sun (High-Voltage Solar Crown)
      "/images/plans/vip7.jpg", // Sunset Rose Gold Sun (Holographic Dusk)
      "/images/plans/vip8.jpg", // Platinum Diamond Solar Crown (Ultra-Elite Radiant)
    ];

    return vipImages[(idx ?? 0) % vipImages.length] || "/images/plans/vip1.jpg";
  };

  const defaultPlanImage = "/images/plans/vip1.jpg";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto [&::-webkit-scrollbar]:hidden relative select-none">
      {/* Page Title Header */}
      <div className="px-5 pt-4 pb-1 flex justify-between items-center max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
          <div>
            <h1 className="text-slate-900 text-[22px] font-black tracking-tight leading-tight">
              Products
            </h1>
            <p className="text-slate-500 text-[12.5px] font-medium mt-0.5">
              Select a suncerestcapital package
            </p>
          </div>
        </div>
      </div>

      {/* User Product Stats Sun Banner */}
      <div className="px-5 pt-3 pb-1 max-w-[480px] mx-auto w-full">
        <div 
          onClick={() => router.push("/dashboard/investments")}
          className="relative w-full rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-transform bg-[#0a1122] h-[105px] flex items-center justify-between px-7 border border-slate-800/40"
        >
          {/* Background Sun Division Image */}
          <img
            src="/images/dashboard/product_sun_banner.jpg"
            alt="Sun Horizon"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />

          {/* Soft Dark Gradient Overlay for optimal contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-slate-950/65" />

          {/* Left Column: My Product */}
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-white text-[28px] sm:text-[30px] font-black leading-none drop-shadow-sm">
              {productCount}
            </span>
            <span className="text-slate-100 text-[13px] font-medium mt-1.5 drop-shadow-xs">
              My Product
            </span>
          </div>

          {/* Right Column: Total Revenue */}
          <div className="relative z-10 flex flex-col items-start justify-center">
            <span className="text-white text-[28px] sm:text-[30px] font-black leading-none drop-shadow-sm">
              {currencySymbol} {formatRevenue(totalRevenue)}
            </span>
            <span className="text-slate-100 text-[13px] font-medium mt-1.5 drop-shadow-xs">
              Total revenue
            </span>
          </div>
        </div>
      </div>

      {/* Series / Category Filter Pills */}
      <div className="px-5 pt-3 pb-1 max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer border text-center whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm scale-[1.01]"
                    : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plans List */}
      <div className="px-4 pt-2 pb-24 space-y-4 max-w-[480px] mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-800" />
            <p className="text-xs font-bold">Loading packages...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm font-bold">No packages available in {activeCategory}.</p>
          </div>
        ) : filteredPlans.map((plan, index) => {
          const minInv = Number(plan.min_investment || 0);
          let dailyInc = Number(plan.daily_income || 0);
          if (dailyInc <= 1 && dailyInc > 0) {
            dailyInc = Number((minInv * dailyInc).toFixed(2));
          }
          const totalInc = plan.total_revenue ? Number(plan.total_revenue) : Number((dailyInc * Number(plan.duration || 0)).toFixed(2));

          return (
            <div key={plan.id} className="bg-white rounded-[20px] p-4 sm:p-5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              
              {/* Upper Section: Flex Image + Details */}
              <div className="flex items-start gap-4">
                {/* Left Product Image */}
                <div className="w-[125px] h-[115px] rounded-[14px] overflow-hidden shrink-0 border border-slate-200/70 bg-slate-900 shadow-xs relative">
                  <img
                    src={getPlanImage(plan, index)}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Details Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[115px]">
                  <div>
                    <h2 className="text-slate-900 font-extrabold text-[16px] tracking-tight leading-snug truncate">
                      {plan.name}
                    </h2>
                    <p className="text-slate-950 font-black text-[17px] mt-1 leading-none tracking-tight">
                      {formatCurrency(minInv)}
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Duration:</span>
                      <span className="text-slate-900 font-bold">{plan.duration}-DAYS</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Daily Income:</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(dailyInc)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-500 font-medium">Total Revenue:</span>
                      <span className="text-slate-950 font-black">{formatCurrency(totalInc)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width BUY NOW / Sold Out Pill Button */}
              {plan.is_sold_out ? (
                <button
                  disabled
                  className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-full text-[13.5px] uppercase tracking-wider flex items-center justify-center cursor-not-allowed shadow-none"
                >
                  <span>Sold Out</span>
                </button>
              ) : (
                <button
                  onClick={() => handleMineClick(plan)}
                  className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold py-3.5 rounded-full transition-all text-[13.5px] shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Purchase Product</span>
                </button>
              )}
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
                <div className="w-[42px] h-[42px] rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-900">
                  <img src={getPlanImage(selectedPlan, filteredPlans.findIndex(p => p.id === selectedPlan.id))} alt={selectedPlan.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-[16px] leading-tight">{selectedPlan.name}</h3>
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

              {/* 1. Properties: Term, Daily Income, Total Expected Revenue */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500 text-[12.5px] font-medium">Term</span>
                  <span className="text-slate-900 text-[14.5px] font-bold">{selectedPlan.duration} days</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-500 text-[12.5px] font-medium">Daily Income</span>
                  <span className="text-slate-900 text-[14.5px] font-bold">{formatCurrency(dailyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-500 text-[12.5px] font-medium">Total Expected Revenue</span>
                  <span className="text-slate-950 text-[15px] font-black">{formatCurrency(totalReturn)}</span>
                </div>
              </div>

              {/* 2. Available Balance */}
              <div>
                <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Available Balance</label>
                <div className="w-full py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Wallet Balance</span>
                  <span className="text-[20px] text-slate-900 font-black">{formatCurrency(balances.main)}</span>
                </div>
              </div>

              {/* 3. Package Price Input */}
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

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex flex-col items-center gap-3">
              <button 
                onClick={handleInvest}
                disabled={isInvesting}
                className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold py-3.5 rounded-full transition-all text-[15px] shadow-sm disabled:opacity-50 flex items-center justify-center cursor-pointer uppercase tracking-wider active:scale-[0.99]"
              >
                {isInvesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRM PURCHASE"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
