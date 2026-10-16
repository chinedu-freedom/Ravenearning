"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function AboutPage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const siteName = settings.site_name || "suncerestcapital";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - Matching our standard site header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/account")}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back to Account"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            About Us
          </h1>
        </div>
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
        </div>
      </div>

      {/* Plain, Clean Write-up - No cards, no extra designs, pure clean reading */}
      <div className="w-full max-w-[480px] mx-auto px-5 py-6 space-y-5 pb-24 text-[14.5px] sm:text-[15px] text-slate-800 leading-[1.75] font-normal">
        <p>
          <span className="capitalize">{siteName}</span> is a global digital asset growth and resource investment company specializing in computational infrastructure and automated yield generation. Committed to making decentralized computing and physical asset earnings accessible to investors worldwide, <span className="capitalize">{siteName}</span> leverages high-efficiency hardware networks and proprietary distribution protocols to deliver a secure, dependable financial experience.
        </p>

        <p>
          The platform&apos;s defining feature is its automated cloud computing infrastructure; investors participate directly in enterprise-grade hashing power without the complexity of hardware maintenance, cooling, or power logistics. Our facilities balance high-performance computing clusters with sustainable and renewable energy sources, delivering consistent daily returns, high operational uptime, and rigorous risk management across varying market conditions.
        </p>

        <p>
          Security and liquidity remain fundamental to <span className="capitalize">{siteName}</span>. The platform implements institutional-level multi-signature vault custody, 256-bit encryption protocols, and audited reserve management to protect investor capital at every stage. Members benefit from total liquidity flexibility, with daily earnings automatically credited every 24 hours, alongside frictionless local banking settlement in South African Rand (Rand) and global cryptocurrency transfers.
        </p>

        <p>
          Currently, <span className="capitalize">{siteName}</span> offers a diversified range of computational investment tiers designed to cater to various financial goals—from introductory starter tiers to high-capacity institutional mining allocations. Thanks to our innovative technology architecture, transparent real-time tracking, and dedicated around-the-clock client support, <span className="capitalize">{siteName}</span> has established itself as a trusted premier brand in modern digital capital growth.
        </p>
      </div>

    </div>
  );
}
