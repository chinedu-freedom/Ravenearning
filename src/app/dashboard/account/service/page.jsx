"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Users, ShieldCheck, Clock } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function CustomerServicePage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const supportTelegram =
    settings.telegram_support_link ||
    settings.telegram_channel_link ||
    "https://t.me/ServeGREATLAND001";

  const groupTelegram =
    settings.telegram_link ||
    settings.telegram_channel_link ||
    "https://t.me/GREATLANDGroup01";

  const handleOpenLink = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24 select-none">
      
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard/account")}
          className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">
          Customer service
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Top Hero Card - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-2.5">
            SUPPORT DESK
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            Service Center
          </h2>
          <p className="text-sky-100 text-[12px] leading-relaxed mb-3">
            Contact customer service
          </p>

          {/* Online Hours Pill */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-white text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>9 AM - 7 PM</span>
          </div>
        </div>

        {/* Card 1: 1-on-1 Customer Service */}
        <div className="bg-[#111827] rounded-[20px] p-6 border border-white/5 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] shadow-[0_0_20px_rgba(2,132,199,0.2)]">
            <Send size={26} className="translate-x-0.5 -translate-y-0.5" />
          </div>

          <h3 className="text-white text-[16px] font-bold tracking-tight">
            Customer Service
          </h3>

          <p className="text-gray-400 text-[12px] max-w-[280px] leading-relaxed">
            If you have any questions or need help, please contact customer service.
          </p>

          <div className="inline-flex items-center gap-1.5 text-gray-400 text-[11px] font-medium bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-white/5">
            <Clock size={12} className="text-[#38bdf8]" />
            <span>9 AM - 7 PM</span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenLink(supportTelegram)}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3 rounded-[12px] text-[14px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            Customer Service
          </button>
        </div>



        {/* Card 3: Notice Guidelines */}
        <div className="bg-[#111827] rounded-[20px] p-4 border border-white/5 shadow-md flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/25 flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-white/95 font-bold text-[13px]">
              Official Support Guidelines
            </h4>
            <p className="text-gray-400 text-[11.5px] mt-0.5 leading-relaxed">
              Official staff will never ask for your account password or withdrawal PIN. Please verify channel links before interacting.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
