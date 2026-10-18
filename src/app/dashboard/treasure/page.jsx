"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Key, 
  Gift, 
  Send, 
  Wallet, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Inbox,
  Volume2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import RewardClaimModal from "@/components/RewardClaimModal";

export default function TreasurePage() {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState("");
  const [claimedModalData, setClaimedModalData] = useState({ isOpen: false, amount: 0, title: "Gift Code Claimed!" });

  const { data: historyData, isLoading, refetch } = useFetchData("/users/treasure/history", ["treasure-history"]);
  const claimMutation = usePost("/users/treasure/claim", ["treasure-history"], false, { showToast: false });
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  const telegramLink = 
    settings.telegram_channel_link || 
    settings.telegram_channel || 
    settings.telegram_support || 
    settings.telegram_link || 
    "https://t.me/suncerestcapital";

  const claims = historyData?.claims || [];

  const totalClaimed = useMemo(() => {
    return claims.reduce((acc, curr) => acc + (parseFloat(curr.reward_amount) || 0), 0);
  }, [claims]);

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    const cleanCode = giftCode.trim();
    if (!cleanCode) {
      toast.error("Please enter a gift code");
      return;
    }

    try {
      const res = await claimMutation.mutateAsync({ code: cleanCode });
      setGiftCode("");
      await refetch();
      const claimedAmount = res?.reward_amount ?? res?.amount ?? res?.reward?.amount ?? res?.bonus ?? 20;
      setClaimedModalData({
        isOpen: true,
        amount: claimedAmount,
        title: "Gift Code Claimed!"
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || "Invalid or expired gift code");
    }
  };

  // Simulated Live Rewards Feed with auto-ticker
  const [liveRewards, setLiveRewards] = useState([
    { id: 1, phone: "***6752", amount: "70.00", time: "Just now" },
    { id: 2, phone: "***8487", amount: "120.00", time: "1m ago" },
    { id: 3, phone: "***3394", amount: "150.00", time: "2m ago" },
    { id: 4, phone: "***6765", amount: "85.00", time: "3m ago" },
    { id: 5, phone: "***4550", amount: "110.00", time: "5m ago" },
    { id: 6, phone: "***6898", amount: "200.00", time: "6m ago" },
    { id: 7, phone: "***6187", amount: "95.00", time: "8m ago" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveRewards((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - White background, Text on left, Logo on right */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/account")}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back to Account"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Lucky Treasure
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
        
        {/* Constituent 1: Stats Overview Card - Matching site format */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[28px] sm:text-[32px] font-black text-emerald-600 tracking-tight leading-none font-mono">
              {currencySymbol}{formatAmount(totalClaimed)}
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">
              Total Bonus Redeemed ({claims.length} {claims.length === 1 ? "claim" : "claims"})
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Gift size={22} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Constituent 2: Gift Code Redemption Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Redeem Gift Code
            </h2>
          </div>

          <p className="text-[12.5px] text-slate-500 leading-relaxed font-normal">
            Enter your secret promotional or community voucher code below to instantly credit your balance.
          </p>

          <form onSubmit={handleClaim} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key size={17} />
              </div>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="Enter gift code here..."
                disabled={claimMutation.isPending}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-[13.5px] font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-slate-400 focus:outline-none transition-all tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={claimMutation.isPending || !giftCode.trim()}
              className="w-full bg-[#0f172a] hover:bg-[#021d3c] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-[14.5px] shadow-md shadow-blue-950/15 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Claim Gift Reward</span>
              )}
            </button>
          </form>
        </div>

        {/* Constituent 3: Modern Connected Workflow & Telegram Community Drop */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          
          {/* Top Telegram Direct Drop Strip */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Send size={18} className="translate-x-[-1px] translate-y-[-1px]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  Official Telegram Drops
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Daily gift codes released
                </p>
              </div>
            </div>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0f172a] hover:bg-[#021d3c] text-white text-[11.5px] font-bold px-3 py-2 rounded-lg shrink-0 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Join</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Connected 3-Step Process Track */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-[#0f172a] border border-slate-200 flex items-center justify-center text-[11px] font-black mb-1.5 shadow-2xs">
                1
              </div>
              <span className="text-[11.5px] font-bold text-slate-900 leading-tight">
                Join Channel
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Watch daily drops
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-[#0f172a] border border-slate-200 flex items-center justify-center text-[11px] font-black mb-1.5 shadow-2xs">
                2
              </div>
              <span className="text-[11.5px] font-bold text-slate-900 leading-tight">
                Copy Code
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Paste into box
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[11px] font-black mb-1.5 shadow-2xs">
                3
              </div>
              <span className="text-[11.5px] font-bold text-slate-900 leading-tight">
                Instant Cash
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Added to balance
              </span>
            </div>
          </div>

        </div>

        {/* Constituent 4: Live Community Payouts - Marquee/Carousel Format matching Dashboard */}
        <div className="space-y-2">
          <h3 className="text-slate-900 text-[14px] font-bold tracking-tight px-0.5">
            Live Community Payouts
          </h3>

          <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-200/90 shadow-2xs overflow-hidden">
            <Volume2 size={18} className="text-slate-700 shrink-0" />
            <div className="relative flex-1 overflow-hidden h-4 flex items-center">
              <div className="flex whitespace-nowrap animate-marquee text-[12px] text-slate-600 font-medium">
                <span className="inline-block pr-8">
                  {liveRewards.map((reward, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 mr-6">
                      <span className="font-mono text-slate-800 font-bold">{reward.phone}</span>
                      <span className="text-slate-400">claimed</span>
                      <span className="font-mono font-black text-emerald-600">+{currencySymbol}{reward.amount}</span>
                      <span className="text-slate-300 ml-2">•</span>
                    </span>
                  ))}
                </span>
                <span className="inline-block pr-8">
                  {liveRewards.map((reward, i) => (
                    <span key={`dup-${i}`} className="inline-flex items-center gap-1.5 mr-6">
                      <span className="font-mono text-slate-800 font-bold">{reward.phone}</span>
                      <span className="text-slate-400">claimed</span>
                      <span className="font-mono font-black text-emerald-600">+{currencySymbol}{reward.amount}</span>
                      <span className="text-slate-300 ml-2">•</span>
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Constituent 5: My Redemptions History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-slate-900 text-[14px] font-bold tracking-tight">
              My Redemption History
            </h3>
            {claims.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">
                {claims.length} total
              </span>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#0f172a] mb-2" />
                <span className="text-[12px] text-slate-500">Loading history...</span>
              </div>
            ) : claims.length > 0 ? (
              <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left border-collapse min-w-[360px]">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-[10.5px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3.5">Code / Promotion</th>
                      <th className="py-2.5 px-3.5">Date</th>
                      <th className="py-2.5 px-3.5 text-right">Reward</th>
                      <th className="py-2.5 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px]">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-900 font-mono">
                          {claim.gift_code?.code_name || claim.gift_code?.code || "VOUCHER"}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-right font-black text-emerald-600 font-mono">
                          +{currencySymbol}{formatAmount(claim.reward_amount)}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 size={10} className="stroke-[2.5]" />
                            Claimed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-2.5">
                  <Inbox size={20} />
                </div>
                <p className="text-slate-800 text-[13.5px] font-bold">
                  No redemptions yet
                </p>
                <p className="text-slate-400 text-[11.5px] mt-0.5 max-w-[240px]">
                  Redeem a gift code above to see your history recorded here.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <RewardClaimModal
        isOpen={claimedModalData.isOpen}
        onClose={() => setClaimedModalData({ isOpen: false, amount: 0, title: "Gift Code Claimed!" })}
        amount={claimedModalData.amount}
        currencySymbol={currencySymbol}
        title={claimedModalData.title}
      />
    </div>
  );
}
