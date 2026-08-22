"use client";

import { useState, useEffect } from "react";
import { useFetchData } from "@/hooks/useApi";
import { ChevronRight, ExternalLink } from "lucide-react";

export default function WelcomeNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settingsRes } = useFetchData("/settings/public", ["public-settings"]);
  const settings = settingsRes?.settings || settingsRes || {};

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("welcome_notice_dismissed");
    if (!isDismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("welcome_notice_dismissed", "true");
    setIsOpen(false);
  };

  const handleTelegramClick = () => {
    const telegramUrl = settings.telegram_support || "https://t.me/ravenearning_official";
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    handleDismiss();
  };

  if (!isOpen) return null;

  const siteName = settings.site_name || "Ravenearning";
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
      <div className="relative bg-white rounded-[24px] max-w-[380px] w-full shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col border border-slate-100 font-['Poppins',sans-serif]">
        
        {/* Top Website Brand Blue Banner */}
        <div className="bg-gradient-to-r from-[#4f8cff] via-[#3b82f6] to-[#2563eb] text-white p-5 pt-6 text-center flex flex-col items-center justify-center relative shadow-sm">
          <h2 className="text-3xl font-black tracking-wider uppercase drop-shadow-xs">
            {siteName}
          </h2>

          <button
            onClick={handleTelegramClick}
            className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium text-blue-100 hover:text-white transition-colors cursor-pointer"
          >
            <span>Click to subscribe to the Telegram channel</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Content List Body */}
        <div className="p-5 text-slate-700 text-[12.5px] leading-relaxed space-y-2.5 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
            4. Daily return rate 25%-40%.
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
            8. {siteName} will be launched in South Africa on August 17.
          </p>
        </div>

        {/* Bottom OK Button */}
        <div className="p-4 pt-1 pb-5 flex justify-center">
          <button
            onClick={handleDismiss}
            className="w-[85%] bg-gradient-to-r from-[#4f8cff] to-[#2563eb] hover:opacity-95 text-white font-black py-3 rounded-full text-[15px] transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider text-center"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
