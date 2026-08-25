"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Gift, Sparkles, X } from "lucide-react";

export default function RewardClaimModal({ isOpen, onClose, amount, currencySymbol = "R", title = "Reward Claimed!" }) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      // Initial center burst
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#4f8cff", "#2563eb", "#6ee7ff", "#10b981", "#3b82f6", "#f59e0b"]
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
          colors: ["#4f8cff", "#2563eb", "#6ee7ff", "#10b981"]
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#4f8cff]/30 text-white rounded-[24px] max-w-[380px] w-full p-6 shadow-2xl relative text-center space-y-5 animate-in zoom-in-95 duration-200">
        
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
          <div className="absolute inset-0 rounded-full bg-[#4f8cff]/20 animate-ping duration-1000" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#4f8cff] flex items-center justify-center shadow-lg shadow-[#4f8cff]/40 text-white font-bold relative z-10">
            <Gift size={38} className="text-white animate-bounce" />
          </div>
          <Sparkles size={20} className="absolute -top-1 -right-1 text-[#6ee7ff] animate-spin" />
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
        <div className="bg-gradient-to-r from-[#4f8cff]/10 via-[#4f8cff]/20 to-[#4f8cff]/10 border border-[#4f8cff]/30 rounded-[16px] py-4 px-3 text-center">
          <span className="text-[#6ee7ff] text-[11px] font-bold uppercase tracking-wider block">
            Bonus Credit Added
          </span>
          <div className="text-[#4f8cff] font-black text-[32px] tracking-tight mt-0.5">
            + {currencySymbol} {Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#4f8cff] via-[#3b82f6] to-[#2563eb] hover:opacity-95 text-white font-black py-3.5 rounded-[14px] text-[15px] shadow-lg shadow-[#4f8cff]/30 cursor-pointer active:scale-[0.98] transition-all"
        >
          GREAT, THANKS!
        </button>

      </div>
    </div>
  );
}
