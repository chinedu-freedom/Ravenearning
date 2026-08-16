"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Award, TrendingUp, Cpu, Globe2, Building2, CheckCircle2 } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function AboutPage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const siteName = settings.site_name || "GREATLAND";

  const siteInitial = siteName.slice(0, 2).toUpperCase() || "GL";

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
          About us
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Hero Section - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white font-black text-[15px] shadow-sm">
              {siteInitial}
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
              RESOURCE GROWTH PLATFORM
            </div>
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            About {siteName}
          </h2>
          <p className="text-sky-100 text-[12.5px] leading-relaxed mb-4">
            Responsible mining. Sustainable value. Long-term returns for investors and communities worldwide.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3">
              <div className="text-[20px] font-black text-white leading-tight">
                2013
              </div>
              <div className="text-sky-100 text-[11px] font-medium mt-0.5">
                Industry roots
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3">
              <div className="text-[20px] font-black text-white leading-tight">
                100+
              </div>
              <div className="text-sky-100 text-[11px] font-medium mt-0.5">
                Regions served
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile Card */}
        <div className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-4">
          <div className="inline-block bg-[#0284c7]/15 text-[#38bdf8] border border-[#0284c7]/25 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold">
            Company profile
          </div>

          {/* Decorative Industry Banner */}
          <div className="w-full h-36 rounded-xl bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#0b0f19] border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0284c7]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Building2 className="text-[#38bdf8]" size={20} />
                <span className="text-white text-[13px] font-bold">Telfer Mining Complex</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Active Operations
              </span>
            </div>
            <div className="z-10">
              <p className="text-gray-400 text-[11px]">Paterson Province, Western Australia</p>
              <p className="text-white/90 text-[13px] font-bold mt-0.5">20Mtpa Nominal Processing Capacity</p>
            </div>
          </div>

          <div className="text-gray-300 text-[12.5px] leading-relaxed space-y-3">
            <p>
              <strong className="text-white">{siteName}</strong> is a leading gold and copper producer. The Company operates one of the largest gold-copper mining complexes and is concurrently developing world-class exploration projects across a significant regional portfolio.
            </p>
            <p>
              Operating with both open pit and underground mining facilities, established logistics infrastructure, and automated ore processing facilities, our platform converts industrial resources into dependable digital investment returns.
            </p>
          </div>
        </div>

        {/* Company Overview & Financial Highlights */}
        <div className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-3.5">
          <h3 className="text-white text-[15px] font-bold tracking-tight">
            Financial & Capital Overview
          </h3>

          <div className="divide-y divide-white/5">
            <div className="py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-gray-400">Market Capitalisation</span>
              <span className="text-white font-bold">$9.1bn</span>
            </div>
            <div className="py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-gray-400">Shares Outstanding</span>
              <span className="text-white font-bold">673m</span>
            </div>
            <div className="py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-gray-400">Net Cash Position</span>
              <span className="text-[#38bdf8] font-bold">$1,208m</span>
            </div>
            <div className="py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-gray-400">Total Available Liquidity</span>
              <span className="text-[#38bdf8] font-black">$1,283m</span>
            </div>
            <div className="py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-gray-400">Total Processing Nominal</span>
              <span className="text-white font-bold">20 Mtpa</span>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8]">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-white text-[13px] font-bold">High Security</h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Enterprise-grade vault protection and multi-sig security.
            </p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8]">
              <TrendingUp size={18} />
            </div>
            <h4 className="text-white text-[13px] font-bold">Daily Yields</h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Consistent daily income distributions from active projects.
            </p>
          </div>
        </div>

        {/* Bottom Compliance Card */}
        <div className="bg-[#111827] rounded-[20px] p-4 border border-white/5 shadow-md flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <h4 className="text-white/95 font-bold text-[13px]">
              Audited & Transparent
            </h4>
            <p className="text-gray-400 text-[11.5px] mt-0.5 leading-relaxed">
              All investment tiers are backed by real-world physical mining assets, verifiable operational capacity, and strict liquidity reserves.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
