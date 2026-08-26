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
    settings.telegram_support ||
    settings.telegram_channel_link ||
    "https://t.me/ravenearning780";

  const groupTelegram =
    settings.telegram_group ||
    settings.telegram_group_chat ||
    settings.telegram_link ||
    settings.telegram_channel_link ||
    "https://t.me/ravenearning780";

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

        {/* Card 1: 1-on-1 Telegram Support */}
        <div className="bg-[#111827] rounded-[20px] p-6 border border-white/5 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] shadow-[0_0_20px_rgba(2,132,199,0.2)]">
            <Send size={26} className="translate-x-0.5 -translate-y-0.5" />
          </div>

          <h3 className="text-white text-[16px] font-bold tracking-tight">
            Telegram Support
          </h3>

          <p className="text-gray-400 text-[12px] max-w-[280px] leading-relaxed">
            Contact official 1-on-1 Telegram customer service for assistance.
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
            Contact Telegram Support
          </button>
        </div>

        {/* Card 2: Official WhatsApp Group */}
        <div className="bg-[#111827] rounded-[20px] p-6 border border-white/5 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.2)]">
            <svg className="w-7 h-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
            </svg>
          </div>

          <h3 className="text-white text-[16px] font-bold tracking-tight">
            WhatsApp Group
          </h3>

          <p className="text-gray-400 text-[12px] max-w-[280px] leading-relaxed">
            Join our official WhatsApp group for community updates, help, and discussion.
          </p>

          <button
            type="button"
            onClick={() => handleOpenLink(settings.whatsapp_group || settings.whatsapp_link || "https://chat.whatsapp.com/ravenearning")}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-bold py-3 rounded-[12px] text-[14px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            Join WhatsApp Group
          </button>
        </div>

        {/* Card 3: Official Telegram Group */}
        <div className="bg-[#111827] rounded-[20px] p-6 border border-white/5 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] shadow-[0_0_20px_rgba(2,132,199,0.2)]">
            <Users size={26} />
          </div>

          <h3 className="text-white text-[16px] font-bold tracking-tight">
            Telegram Group
          </h3>

          <p className="text-gray-400 text-[12px] max-w-[280px] leading-relaxed">
            Join the official Telegram group to connect with members and stay updated with platform announcements.
          </p>

          <button
            type="button"
            onClick={() => handleOpenLink(groupTelegram)}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3 rounded-[12px] text-[14px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            Join Telegram Group
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
