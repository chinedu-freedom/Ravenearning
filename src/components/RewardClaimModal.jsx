"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Gift, CheckCircle2, Sparkles, X } from "lucide-react";

export default function RewardClaimModal({ isOpen, onClose, amount, currencySymbol = "R", title = "Reward Claimed!" }) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      // Initial center burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"]
      });

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ["#f59e0b", "#10b981", "#6366f1", "#f43f5e"]
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-amber-500/30 text-white rounded-[24px] max-w-[380px] w-full p-6 shadow-2xl relative text-center space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Floating Gift Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-1000" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-bold relative z-10">
            <Gift size={38} className="text-slate-950 animate-bounce" />
          </div>
          <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-300 animate-spin" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-[22px] font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>🎉</span>
            <span>{title}</span>
          </h3>
          <p className="text-slate-400 text-[13px] mt-1">
            Congratulations! Your bonus has been claimed.
          </p>
        </div>

        {/* Claimed Amount Display */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-[16px] py-4 px-3 text-center">
          <span className="text-amber-400/80 text-[11px] font-bold uppercase tracking-wider block">
            Bonus Credit Added
          </span>
          <div className="text-amber-400 font-black text-[32px] tracking-tight mt-0.5">
            + {currencySymbol} {Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-[14px] text-[15px] shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98] transition-all"
        >
          GREAT, THANKS!
        </button>

      </div>
    </div>
  );
}
