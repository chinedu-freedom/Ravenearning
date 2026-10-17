"use client";

import { HelpCircle, X, Pointer, Gift, Star, Crown } from "lucide-react";

export default function HowToPlayModal({ isOpen, setIsOpen }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={() => setIsOpen(false)} 
      />

      {/* Modal Dialog Card - Perfectly Centered in the middle of the page */}
      <div className="relative bg-white rounded-[24px] w-full max-w-[340px] border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 select-none z-10">
        {/* Cancel / Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 className="text-[17px] font-black text-slate-900 tracking-tight">How to Play</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Item 1 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Pointer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Tap to Spin</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Press the Start button in the center of the wheel to begin spinning.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Win Instant Prizes</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                The wheel will stop on a random prize. All cash rewards are instantly credited to your balance.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Earn Free Spins</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Get free spins through deposits and by inviting friends to join.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Hit the Jackpot</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Land on the jackpot segment to win the biggest cash prize available!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-6 pb-5 pt-1">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] transition-colors cursor-pointer active:scale-98"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
