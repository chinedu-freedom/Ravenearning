"use client";

import { useEffect } from "react";
import { Gift, Sparkles, X } from "lucide-react";

export default function RewardClaimModal({ isOpen, onClose, amount, currencySymbol = "R", title = "Reward Claimed!" }) {
  useEffect(() => {
    if (isOpen) {
      import("canvas-confetti").then((module) => {
        const confetti = module.default || module;
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        confetti({
          particleCount: 90,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#0f172a", "#10b981", "#3b82f6", "#f59e0b", "#ffffff"]
        });

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
            colors: ["#0f172a", "#10b981", "#3b82f6", "#f59e0b"]
          });
        }, 250);
      }).catch((err) => {
        console.warn("Confetti module notice:", err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-[380px] w-full p-6 shadow-2xl relative text-center space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Brand Gift Icon */}
        <div className="relative mx-auto w-18 h-18 flex items-center justify-center">
          <div className="w-18 h-18 rounded-2xl bg-slate-100 text-[#0f172a] border border-slate-200/90 flex items-center justify-center shadow-2xs font-bold relative z-10">
            <Gift size={34} className="text-[#0f172a]" />
          </div>
          <Sparkles size={18} className="absolute -top-1 -right-1 text-emerald-500 animate-spin" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            <span>🎉</span>
            <span>{title}</span>
          </h3>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">
            Congratulations! Your bonus has been claimed.
          </p>
        </div>

        {/* Claimed Amount Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-3 text-center">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
            Bonus Credit Added
          </span>
          <div className="text-emerald-600 font-black text-[30px] tracking-tight mt-0.5 font-mono">
            + {currencySymbol} {Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#0f172a] hover:bg-[#021d3c] text-white font-bold py-3.5 rounded-xl text-[14.5px] shadow-md shadow-blue-950/15 cursor-pointer active:scale-[0.98] transition-all"
        >
          GREAT, THANKS!
        </button>

      </div>
    </div>
  );
}
