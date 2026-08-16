"use client";

import { useState, useEffect } from "react";
import { useFetchData } from "@/hooks/useApi";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function TelegramModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const siteName = settings.site_name || "Ravenearning";
  
  // Resolve link: telegram_channel or telegram_group or telegram_support
  const telegramLink = settings.telegram_channel || settings.telegram_group || settings.telegram_support || settings.whatsapp_group || "#";

  useEffect(() => {
    // Automatically open on mount when the dashboard loads
    setIsOpen(true);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-telegram-modal", handleOpen);
    window.addEventListener("open-whatsapp-modal", handleOpen);
    return () => {
      window.removeEventListener("open-telegram-modal", handleOpen);
      window.removeEventListener("open-whatsapp-modal", handleOpen);
    };
  }, []);

  const handleJoin = () => {
    setIsOpen(false);
    if (telegramLink && telegramLink !== "#") {
      window.open(telegramLink, "_blank");
    } else {
      toast.info("Telegram channel link is not configured yet.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-[340px] bg-[#111827] rounded-[24px] border border-white/10 shadow-2xl p-7 flex flex-col items-center text-center z-10 animate-in zoom-in-95 duration-200">
        
        {/* Cancel / Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Telegram Icon */}
        <div className="w-[68px] h-[68px] bg-gradient-to-br from-[#2AABEE] to-[#229ED9] rounded-full flex items-center justify-center mb-5 shadow-[0_8px_20px_rgba(34,158,217,0.4)]">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white translate-x-[-1px] translate-y-[1px]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.66-.54.82-1.09.51l-3.02-2.22-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.61-5.07c.24-.22-.05-.34-.38-.13l-6.93 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.64-4.48c.54-.2 1.01.12.84 1.01z"/>
          </svg>
        </div>

        <h2 className="text-[18px] font-black text-white tracking-tight mb-2">
          Official Channel Release
        </h2>
        
        <p className="text-[13px] text-gray-400 mb-7 leading-relaxed font-normal">
          Join our official Telegram channel to get the latest updates, gift bonus codes, and information about the {siteName} platform.
        </p>
        
        <button 
          className="w-full bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] hover:opacity-95 text-white rounded-[14px] h-[48px] text-[15px] font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center uppercase tracking-wide active:scale-[0.99]"
          onClick={handleJoin}
        >
          Join Telegram
        </button>
      </div>
    </div>
  );
}
