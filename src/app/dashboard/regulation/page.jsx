"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function RegulationPage() {
  const router = useRouter();

  // Fetch settings
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);

  const settings = settingsRes?.settings || {};
  const siteName = settings.site_name || "Sun Crest Capital";
  const currencySymbol = settings.currency_symbol || "R";
  const registrationBonus = settings.registration_bonus ?? 100;
  const level1 = settings.level1_commission ?? 30;
  const level2 = settings.level2_commission ?? 3;
  const level3 = settings.level3_commission ?? 2;
  const openTime = settings.withdrawal_open_time || "09:00";
  const closeTime = settings.withdrawal_close_time || "18:00";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">

      {/* Top Header Bar - White background, Text on left, Logo on right */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Regulation
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

      {/* Main Container */}
      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-5 pb-24 text-slate-800">

        {/* Static Investment Plans Image */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900">
          <img
            src="/plan.jpeg"
            alt="Suncerest Capital Investment Plans"
            className="w-full h-auto object-cover rounded-2xl block"
          />
        </div>

        {/* Written Information Section - Exactly matching our platform details */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 text-[13.5px] leading-relaxed text-slate-700 font-normal">

          <p className="font-medium text-slate-900 leading-snug">
            <strong className="capitalize">{siteName}</strong> is an enterprise clean energy and high-yield computational platform specializing in solar-powered digital revenue infrastructure.
          </p>

          {/* Team Referral Commissions Rules */}
          <div className="space-y-2.5 pt-1 text-slate-700">
            <p>
              When a friend you invite registers and invests, you immediately receive a cash reward equal to <strong className="text-slate-900 font-bold">{level1}%</strong> of their investment amount.
            </p>
            <p>
              When a member of your Level 2 team invests, you receive a <strong className="text-slate-900 font-bold">{level2}%</strong> cash reward.
            </p>
            <p>
              When a member of your Level 3 team invests, you receive a <strong className="text-slate-900 font-bold">{level3}%</strong> cash reward.
            </p>
            <p className="text-emerald-700 font-semibold bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-[12.5px] leading-relaxed">
              Once your team members invest, the cash rewards are immediately credited to your withdrawable balance and are available for instant withdrawal.
            </p>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Numbered Regulation Items (1 to 8) matching our platform */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <p>
                Invest <strong className="text-slate-900">{currencySymbol}200</strong> and start generating automated daily returns immediately.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <p>
                Sign-up bonus: <strong className="text-slate-900">{currencySymbol}{registrationBonus}</strong> credited directly to your account.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <p>
                Daily check-in bonus: <strong className="text-slate-900">{currencySymbol}1</strong> available every 24 hours.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                4
              </span>
              <p>
                High daily return rate of <strong>25%–50%</strong>; recover your full investment and generate continuous ongoing profits throughout the contract duration.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                5
              </span>
              <p>
                Invite others to invest and immediately receive multi-tier team cash rewards up to <strong className="text-slate-900">{level1 + level2 + level3}%</strong> total commission.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                6
              </span>
              <p>
                Product earnings are automatically credited to your account every 24 hours and can be withdrawn at any time during daily banking hours (<strong className="text-slate-900">{openTime} – {closeTime}</strong>).
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                7
              </span>
              <p>
                Purchase multiple equipment devices and VIP plans to earn higher cumulative daily returns.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                8
              </span>
              <p>
                <strong className="capitalize">{siteName}</strong> officially established in South Africa, providing certified clean energy solutions and reliable capital growth.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
