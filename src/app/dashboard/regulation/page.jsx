"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sun, 
  Coins, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Users,
  Flame,
  Award
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function RegulationPage() {
  const router = useRouter();

  // Fetch settings & plans
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const { data: plansRes } = useFetchData("/plans", ["plans-data"]);

  const settings = settingsRes?.settings || {};
  const siteName = settings.site_name || "Sun Crest Capital";
  const currencySymbol = settings.currency_symbol || "R";
  const registrationBonus = settings.registration_bonus ?? 100;
  const level1 = settings.level1_commission ?? 30;
  const level2 = settings.level2_commission ?? 10;
  const level3 = settings.level3_commission ?? 5;
  const openTime = settings.withdrawal_open_time || "09:00";
  const closeTime = settings.withdrawal_close_time || "18:00";

  // Fallback official VIP products if plans not yet loaded
  const fallbackPlans = useMemo(() => [
    { name: "Raven Z6X", min_investment: 300, daily_income: 75, duration: 180 },
    { name: "Raven Z7 Max", min_investment: 700, daily_income: 204, duration: 180 },
    { name: "Raven Z8 Ultra", min_investment: 1500, daily_income: 390, duration: 180 },
    { name: "Raven H4 Pro", min_investment: 3500, daily_income: 795, duration: 180 },
    { name: "Raven H8 Max", min_investment: 7000, daily_income: 1620, duration: 180 },
    { name: "Raven H9 Ultra", min_investment: 15000, daily_income: 3360, duration: 180 },
    { name: "Raven T7", min_investment: 30000, daily_income: 7500, duration: 180 },
    { name: "Raven T10 Pro", min_investment: 50000, daily_income: 20000, duration: 180 }
  ], []);

  const vipPlans = useMemo(() => {
    const raw = plansRes?.data;
    if (Array.isArray(raw) && raw.length > 0) {
      const filtered = raw.filter((p) => p.category === "VIP Series" || !p.category?.includes("Activity"));
      if (filtered.length > 0) {
        return filtered.sort((a, b) => (parseFloat(a.min_investment) || 0) - (parseFloat(b.min_investment) || 0));
      }
    }
    return fallbackPlans;
  }, [plansRes, fallbackPlans]);

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Badge colors for VIP levels
  const vipBadgeStyles = [
    "bg-amber-400 text-amber-950",
    "bg-sky-500 text-white",
    "bg-rose-500 text-white",
    "bg-yellow-400 text-yellow-950",
    "bg-amber-500 text-white",
    "bg-purple-500 text-white",
    "bg-emerald-500 text-white",
    "bg-slate-800 text-white"
  ];

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
        
        {/* Banner Graphic Card - Exactly matching the reference image layout */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-[#0f172a] text-white">
          
          {/* Top Hero Banner */}
          <div className="relative p-5 bg-gradient-to-br from-[#021d3c] via-[#092244] to-[#0f172a] border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Brand Logo"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/60 shrink-0 shadow-sm"
                />
                <div>
                  <div className="text-[14px] font-black tracking-wider uppercase text-white leading-tight">
                    {siteName}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold tracking-wide uppercase">
                    Solar Energy &amp; Compute
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Flame size={12} className="fill-slate-950" />
                High Yield
              </span>
            </div>

            <div className="mt-3">
              <div className="inline-block bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] sm:text-[12px] px-3 py-1 rounded-md tracking-tight shadow-sm mb-1.5">
                Invest Today, Earn Tomorrow
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-black text-white tracking-tight leading-snug">
                Verified Solar Power Infrastructure
              </h2>
            </div>
          </div>

          {/* Table Container - Density & structure matching the screenshot */}
          <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden bg-[#0c1527]">
            <table className="w-full text-left border-collapse min-w-[380px] sm:min-w-[420px] text-[11px] sm:text-[12px]">
              <thead>
                <tr className="bg-[#0284c7] text-white font-bold text-[10.5px] uppercase tracking-wider border-b border-sky-400/30">
                  <th className="py-2.5 px-2.5 text-left">
                    <span className="flex items-center gap-1">
                      <Sun size={12} className="text-amber-300 shrink-0" />
                      Product
                    </span>
                  </th>
                  <th className="py-2.5 px-2 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Coins size={12} className="text-amber-300 shrink-0" />
                      Price
                    </span>
                  </th>
                  <th className="py-2.5 px-2 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Zap size={12} className="text-amber-300 shrink-0" />
                      Daily
                    </span>
                  </th>
                  <th className="py-2.5 px-2 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingUp size={12} className="text-amber-300 shrink-0" />
                      Total
                    </span>
                  </th>
                  <th className="py-2.5 px-2.5 text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Calendar size={12} className="text-amber-300 shrink-0" />
                      Days
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {vipPlans.map((plan, idx) => {
                  const price = parseFloat(plan.min_investment) || 0;
                  const daily = parseFloat(plan.daily_income) || 0;
                  const days = parseInt(plan.duration) || 180;
                  const total = daily * days;
                  const vipNumber = idx + 1;
                  const badgeStyle = vipBadgeStyles[idx % vipBadgeStyles.length];

                  return (
                    <tr
                      key={plan.id || idx}
                      className={`hover:bg-white/5 transition-colors ${
                        idx % 2 === 0 ? "bg-[#0b1324]" : "bg-[#080e1c]"
                      }`}
                    >
                      {/* Product */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-tight ${badgeStyle}`}
                          >
                            VIP{vipNumber}
                          </span>
                          <span className="text-white font-bold text-[11px] truncate max-w-[100px] sm:max-w-[120px]">
                            {plan.name}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-100 whitespace-nowrap">
                        {currencySymbol} {formatAmount(price)}
                      </td>

                      {/* Daily Income */}
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {currencySymbol} {formatAmount(daily)}
                      </td>

                      {/* Total Revenue */}
                      <td className="py-2 px-2 text-right font-mono font-black text-amber-300 whitespace-nowrap">
                        {currencySymbol} {formatAmount(total)}
                      </td>

                      {/* Days */}
                      <td className="py-2 px-2.5 text-center text-slate-300 text-[10.5px] whitespace-nowrap font-medium">
                        {days} day
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Features Strip of the Banner */}
          <div className="bg-[#021d3c] px-3 py-2.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-slate-300">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap size={11} />
              </div>
              <span>24h Auto Payout</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={11} />
              </div>
              <span>Reliable Brand</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-bold italic">
              <Award size={11} />
              <span>Your Best Choice!</span>
            </div>
          </div>

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
              Once your team members invest, the cash rewards are immediately credited to your account balance and are available for instant withdrawal.
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
                Invest <strong className="text-slate-900">{currencySymbol}300</strong> and start generating automated daily returns immediately.
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
