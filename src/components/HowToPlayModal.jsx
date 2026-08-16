"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HelpCircle, X, Pointer, Gift, Star, Crown } from "lucide-react";

export default function HowToPlayModal({ isOpen, setIsOpen }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[340px] p-0 overflow-hidden bg-[#111827] rounded-[24px] border border-white/5 shadow-2xl relative">
        {/* Cancel / Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-30"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-white/5">
          <div className="w-6 h-6 rounded-full bg-[#4f8cff]/20 flex items-center justify-center">
            <HelpCircle className="text-[#4f8cff] w-3.5 h-3.5" />
          </div>
          <h2 className="text-[16px] font-bold text-white/90">How to Play</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Item 1 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-[12px] bg-[#4f8cff]/10 flex items-center justify-center shrink-0">
              <Pointer className="text-[#4f8cff] w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white/90 mb-0.5">Tap to Spin</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Press the Start button in the center of the wheel to begin spinning.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-[12px] bg-[#4f8cff]/10 flex items-center justify-center shrink-0">
              <Gift className="text-[#4f8cff] w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white/90 mb-0.5">Win Prizes</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The wheel will stop on a random prize. All winnings are instantly credited to your account.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-[12px] bg-[#4f8cff]/10 flex items-center justify-center shrink-0">
              <Star className="text-[#4f8cff] w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white/90 mb-0.5">Earn Free Spins</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Get free spins through deposits and by inviting friends to join.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-[12px] bg-[#4f8cff]/10 flex items-center justify-center shrink-0">
              <Crown className="text-[#4f8cff] w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white/90 mb-0.5">Hit the Jackpot</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Land on the jackpot segment to win the biggest prize available!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
