"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Key, Gift, Info, Send, Ticket, Wallet, History, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Image from "next/image";
import RewardClaimModal from "@/components/RewardClaimModal";

export default function TreasurePage() {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState("");
  const [claimedModalData, setClaimedModalData] = useState({ isOpen: false, amount: 0, title: "Gift Code Claimed!" });

  const { data: historyData, isLoading } = useFetchData("/users/treasure/history", ["treasure-history"]);
  const claimMutation = usePost("/users/treasure/claim", "treasure-history");
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const claims = historyData?.claims || [];

  const handleClaim = (e) => {
    e.preventDefault();
    if (!giftCode.trim()) {
      toast.error("Please enter a gift code");
      return;
    }
    claimMutation.mutate({ code: giftCode.trim() }, {
      onSuccess: (res) => {
        setGiftCode("");
        const claimedAmount = res?.reward_amount ?? res?.amount ?? res?.reward?.amount ?? res?.bonus ?? 20;
        setClaimedModalData({
          isOpen: true,
          amount: claimedAmount,
          title: "Gift Code Claimed!"
        });
      }
    });
  };

  const [liveRewards, setLiveRewards] = useState([
    { id: 1, phone: "***6752", amount: "70.48" },
    { id: 2, phone: "***8487", amount: "121.18" },
    { id: 3, phone: "***3394", amount: "128.27" },
    { id: 4, phone: "***6765", amount: "126.98" },
    { id: 5, phone: "***4550", amount: "112.32" },
    { id: 6, phone: "***6898", amount: "120.51" },
    { id: 7, phone: "***6187", amount: "112.68" },
    { id: 8, phone: "***9921", amount: "150.00" },
    { id: 9, phone: "***5534", amount: "95.20" },
    { id: 10, phone: "***1209", amount: "135.50" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveRewards((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20">
      {/* Header Section */}
      <div className="bg-[#111827] px-4 pt-6 pb-20 relative border-b border-white/5">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="text-[64px] leading-none mb-3 drop-shadow-lg">
            🎁
          </div>
          <h1 className="text-white/90 text-[24px] font-bold mb-1 tracking-wide">Lucky Treasure</h1>
          <p className="text-gray-400 text-[13px]">Redeem your gift code for rewards</p>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-20 space-y-5">
        {/* Claim Card */}
        <div className="bg-[#111827] rounded-[20px] p-5 shadow-sm border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="text-[#4f8cff]" size={20} />
            <h2 className="text-[15px] font-bold text-white/90">Enter Gift Code</h2>
          </div>

          <form onSubmit={handleClaim}>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="Enter your code here..."
                className="w-full bg-white/5 border border-white/5 rounded-[12px] py-3 pl-10 pr-4 text-[14px] text-white/90 placeholder:text-gray-500 outline-none focus:border-[#4f8cff] focus:bg-white/10 transition-colors"
                disabled={claimMutation.isPending}
              />
            </div>

            <button 
              type="submit"
              disabled={claimMutation.isPending || !giftCode.trim()}
              className="w-full bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] hover:opacity-95 text-white py-3.5 rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 cursor-pointer uppercase tracking-wider"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Gift size={18} />
                  Claim Reward
                </>
              )}
            </button>
          </form>
        </div>

        {/* How It Works */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-5 h-5 rounded-full bg-blue-100/60 flex items-center justify-center">
              <Info className="text-[#4f8cff]" size={12} />
            </div>
            <h3 className="font-bold text-slate-900 text-[15px]">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div 
              onClick={() => setIsTelegramModalOpen(true)}
              className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm cursor-pointer hover:border-[#4f8cff] transition-colors"
            >
              <div className="w-10 h-10 bg-blue-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Send className="text-[#4f8cff]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Get gift code from Telegram</p>
            </div>
            <div className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm">
              <div className="w-10 h-10 bg-blue-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Ticket className="text-[#4f8cff]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Enter your unique gift code</p>
            </div>
            <div className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm">
              <div className="w-10 h-10 bg-blue-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Wallet className="text-[#4f8cff]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Reward added to balance</p>
            </div>
          </div>
        </div>

        {/* Recent Rewards Live Feed (Matching goldengreatland share/share) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-[#f59e0b]">
                <Gift size={12} />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px]">Recent rewards</h3>
            </div>

          </div>

          <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm overflow-hidden">
            <div className="divide-y divide-white/5">
              {liveRewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="px-4 py-3 flex items-center justify-between transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/15 flex items-center justify-center text-[#f59e0b] shrink-0">
                      <Gift size={15} />
                    </div>
                    <span className="text-[13px] font-medium text-white/90 font-mono">
                      {reward.phone}
                    </span>
                  </div>
                  <div className="text-[13.5px] font-bold text-[#f59e0b]">
                    +{settings.currency_symbol || "R"}{reward.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Redemptions History */}
        {claims.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <div className="flex items-center gap-2">
                <History className="text-[#4f8cff]" size={18} />
                <h3 className="font-bold text-slate-900 text-[15px]">My Redemptions</h3>
              </div>
              <button 
                onClick={() => router.push('/dashboard/transactions')}
                className="text-[#4f8cff] text-[12px] font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm overflow-hidden">
              <div className="divide-y divide-white/5">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-900/20 rounded-[10px] flex items-center justify-center shrink-0">
                        <Gift className="text-[#16a34a]" size={20} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white/90">
                          {claim.gift_code?.code_name || claim.gift_code?.code || 'Gift Reward'}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[#10b981]">
                        +{settings.currency_symbol || "R"}{Number(claim.reward_amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium bg-white/5 border border-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Claimed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <RewardClaimModal
        isOpen={claimedModalData.isOpen}
        onClose={() => setClaimedModalData({ isOpen: false, amount: 0, title: "Gift Code Claimed!" })}
        amount={claimedModalData.amount}
        currencySymbol={settings.currency_symbol || "R"}
        title={claimedModalData.title}
      />
    </div>
  );
}
