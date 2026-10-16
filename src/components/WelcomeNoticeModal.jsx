"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { ChevronRight, ExternalLink } from "lucide-react";

export default function WelcomeNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: settingsRes } = useFetchData("/settings/public", ["public-settings"]);
  const settings = settingsRes?.settings || settingsRes || {};

  useEffect(() => {
    // Clear any previous dismissed flags from session
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("welcome_notice_dismissed");
    }

    // Pop up whenever the user visits the dashboard home
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      setIsOpen(true);
    }
  }, [pathname]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleTelegramClick = () => {
    const telegramUrl = settings.telegram_support || "https://t.me/suncerestcapital";
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    handleDismiss();
  };

  if (!isOpen) return null;

  const siteName = settings.site_name || "suncerestcapital";
  const regBonus = Number(settings.registration_bonus ?? 100);
  const refComm = Number(settings.level1_commission || 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" 
        onClick={handleDismiss} 
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-[24px] max-w-[365px] w-[92%] max-h-[72vh] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col border border-slate-100 font-['Poppins',sans-serif]">
        
        {/* Top Website Brand Banner */}
        <div className="shrink-0 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-5 py-4 text-center flex flex-col items-center justify-center relative shadow-sm border-b border-slate-800/50">
          <h2 className="text-[26px] font-black tracking-wider uppercase drop-shadow-xs">
            {siteName}
          </h2>

          <button
            onClick={handleTelegramClick}
            className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Click to subscribe to the Telegram channel</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content List Body */}
        <div className="flex-1 min-h-0 p-5 overflow-y-auto text-slate-700 text-[13px] leading-relaxed space-y-3 overscroll-contain">
          <p className="font-semibold text-slate-800">
            1. Invest in ZAR and earn daily cash income.
          </p>
          <p className="font-semibold text-slate-800">
            2. Registration Bonus: ZAR{regBonus}.
          </p>
          <p className="font-semibold text-slate-800">
            3. Daily Check-in Bonus: ZAR1.
          </p>
          <p className="font-semibold text-slate-800">
            4. Daily return.
          </p>
          <p className="font-semibold text-slate-800">
            5. Invite your downline to invest, and you will immediately receive a cash reward of {refComm}% of their investment amount.
          </p>
          <p className="font-semibold text-slate-800">
            6. Product income is automatically deposited into your account 24 hours a day and can be withdrawn at any time.
          </p>
          <p className="font-semibold text-slate-800">
            7. You can purchase multiple devices to earn more income.
          </p>
          <p className="font-semibold text-slate-800">
            8. {siteName} will be launched in South Africa on August.
          </p>
        </div>

        {/* Bottom OK Button */}
        <div className="shrink-0 p-4 pt-2 pb-5 flex justify-center bg-white border-t border-slate-100/80">
          <button
            onClick={handleDismiss}
            className="w-[85%] bg-[#0f172a] hover:bg-[#1e293b] text-white font-black py-3.5 rounded-full text-[15px] transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider text-center"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
