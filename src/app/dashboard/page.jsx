"use client";

import { useRouter } from "next/navigation";
import { Volume2 } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import PageLoader from "@/components/PageLoader";

export default function DashboardPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();

  // Fetch backend settings & profile
  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};

  const { data: userProfileResponse, isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  if (isLoadingSettings || isLoadingProfile) {
    return <PageLoader />;
  }

  const currencySymbol = settings.currency_symbol || "R";
  const balance = parseFloat(userProfile?.balance ?? 150);
  const cumulativeIncome = parseFloat(userProfile?.statistics?.total_income ?? userProfile?.withdrawable_balance ?? 150);
  const totalWithdrawal = parseFloat(userProfile?.statistics?.total_withdrawal ?? 0);

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const supportLink = settings?.telegram_support || settings?.telegram_channel || settings?.telegram_link || "https://t.me/suncerestcapital";

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 pb-10 select-none">
      
      {/* 1. Top Hero Banner */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src="/images/dashboard/hero_banner.jpg"
          alt="Dashboard Hero"
          className="w-full h-full object-cover"
        />

        {/* Hero Overlay Text & Shop Now Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end px-4 pb-7">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col pr-2">
              <h2 className="text-white text-[16.5px] font-bold tracking-tight leading-tight drop-shadow-sm">
                Harness the Power of the Sun
              </h2>
              <p className="text-white/85 text-[11px] font-normal mt-0.5 drop-shadow-sm">
                Invest today for bright daily returns
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/mining")}
              className="shrink-0 px-4 py-1.5 rounded-full bg-slate-400/50 hover:bg-slate-400/70 active:scale-95 backdrop-blur-md text-white text-[12px] font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <div className="px-3.5 space-y-3.5 -mt-3 relative z-10">

        {/* 2. Top Action Buttons Card (Recharge, Withdraw, Customer Service, Check-in) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
          <div className="grid grid-cols-4 items-center gap-1">

            {/* Recharge */}
            <button
              onClick={() => router.push("/dashboard/wallet/deposit")}
              className="flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 flex items-center justify-center text-[#64748b] group-hover:text-slate-900 transition-colors">
                <svg viewBox="0 0 48 48" className="w-9 h-9" fill="currentColor">
                  {/* Money bag drawstring pouch */}
                  <path d="M17 14 C17 14 19 17 21 17 L27 17 C29 17 31 14 31 14 C27 15 21 15 17 14 Z" fill="currentColor"/>
                  <path d="M14 18 C14 18 10 24 10 33 C10 39.5 16 41.5 24 41.5 C32 41.5 38 39.5 38 33 C38 24 34 18 34 18 Z" fill="currentColor"/>
                  <circle cx="24" cy="30" r="6" fill="#ffffff" />
                  <path d="M21.5 27.5 L24 30 L26.5 27.5 M24 30 L24 33.5 M22 30.5 L26 30.5 M22 31.8 L26 31.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[12px] text-gray-700 font-medium mt-1 leading-tight text-center">
                Recharge
              </span>
            </button>

            {/* Withdraw */}
            <button
              onClick={() => router.push("/dashboard/wallet/withdraw")}
              className="flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 flex items-center justify-center text-[#64748b] group-hover:text-slate-900 transition-colors">
                <svg viewBox="0 0 48 48" className="w-9 h-9" fill="currentColor">
                  {/* ATM Slot */}
                  <rect x="11" y="11" width="26" height="11" rx="2.5" fill="currentColor" />
                  <rect x="15" y="18" width="18" height="2.5" rx="1.2" fill="#ffffff" />
                  {/* Banknote out */}
                  <rect x="13.5" y="18" width="21" height="17" rx="2" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
                  <circle cx="24" cy="26.5" r="4" fill="#ffffff" />
                  <path d="M24 24.2 L24 28.8 M22.5 25.5 C22.5 24.7 25.5 24.7 25.5 26 C25.5 27.3 22.5 27.3 22.5 28.5 C22.5 29.3 25.5 29.3 25.5 28.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[12px] text-gray-700 font-medium mt-1 leading-tight text-center">
                Withdraw
              </span>
            </button>

            {/* Customer Service */}
            <button
              onClick={() => window.open(supportLink, "_blank")}
              className="flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 flex items-center justify-center text-[#64748b] group-hover:text-slate-900 transition-colors">
                <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
                  <path d="M13 25 C13 18.5 17.5 13 24 13 C30.5 13 35 18.5 35 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <rect x="10" y="23" width="6" height="11" rx="3" fill="currentColor" />
                  <rect x="32" y="23" width="6" height="11" rx="3" fill="currentColor" />
                  <path d="M34 31 C34 37 29.5 39 25 39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="23.5" cy="39" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[12px] text-gray-700 font-medium mt-1 leading-tight text-center whitespace-nowrap">
                Customer Service
              </span>
            </button>

            {/* Check-in */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-daily-checkin"))}
              className="flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 flex items-center justify-center text-[#64748b] group-hover:text-slate-900 transition-colors">
                <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
                  {/* Calendar Outline */}
                  <rect x="11" y="11" width="26" height="26" rx="4" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="11" y1="19.5" x2="37" y2="19.5" stroke="currentColor" strokeWidth="2.5" />
                  {/* Binder rings */}
                  <line x1="18" y1="8" x2="18" y2="13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="30" y1="8" x2="30" y2="13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Checkmark */}
                  <path d="M18.5 28 L22.5 32 L29.5 24.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[12px] text-gray-700 font-medium mt-1 leading-tight text-center">
                Check-in
              </span>
            </button>

          </div>
        </div>

        {/* 3. Task Center Banner Card */}
        <div
          onClick={() => router.push("/dashboard/task")}
          className="relative w-full h-[100px] rounded-2xl overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99] transition-transform"
        >
          <img
            src="/images/dashboard/task_banner.jpg"
            alt="Task Center"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-4">
            <h3 className="text-white text-[18px] font-bold tracking-tight leading-tight drop-shadow-sm">
              Task Center
            </h3>
            <button className="mt-2 w-fit px-6 py-1 bg-white text-gray-900 font-bold text-[13px] rounded-full shadow hover:bg-gray-100 transition-all cursor-pointer">
              Go
            </button>
          </div>
        </div>

        {/* 3b. Active Package Banner Card */}
        <div
          onClick={() => router.push("/dashboard/investments")}
          className="relative w-full h-[100px] rounded-2xl overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99] transition-transform"
        >
          <img
            src="/images/dashboard/active_pkg_banner.jpg"
            alt="Active Package"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-4">
            <h3 className="text-white text-[18px] font-bold tracking-tight leading-tight drop-shadow-sm">
              Active Package
            </h3>
            <button className="mt-2 w-fit px-6 py-1 bg-white text-gray-900 font-bold text-[13px] rounded-full shadow hover:bg-gray-100 transition-all cursor-pointer">
              Go
            </button>
          </div>
        </div>

        {/* 4. Marquee Announcement Bar */}
        <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
          <Volume2 size={18} className="text-gray-700 shrink-0" />
          <div className="relative flex-1 overflow-hidden h-4 flex items-center">
            <div className="flex whitespace-nowrap animate-marquee text-[12px] text-gray-600 font-medium">
              <span className="inline-block pr-8">
                7 Recharge 10,000 ******3841 Recharge 2,000 ******8089 Recharge 5,000 ******2190 Recharge 1,500 ******9044 Recharge 10,000 ******6120 Recharge 3,000 ******4412 Recharge 20,000
              </span>
              <span className="inline-block pr-8">
                7 Recharge 10,000 ******3841 Recharge 2,000 ******8089 Recharge 5,000 ******2190 Recharge 1,500 ******9044 Recharge 10,000 ******6120 Recharge 3,000 ******4412 Recharge 20,000
              </span>
            </div>
          </div>
        </div>

        {/* 5. 2-Column Metrics Grid (Balance, Cumulative, Withdrawal) */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Left Column: Tall Balance Card */}
          <div
            onClick={() => router.push("/dashboard/account/balance")}
            className="h-[215px] relative rounded-2xl overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99] transition-transform"
          >
            <img
              src="/images/dashboard/balance_card.jpg"
              alt="Balance"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3.5">
              <div className="text-white text-[20px] font-extrabold tracking-tight leading-tight drop-shadow-sm">
                {currencySymbol} {formatAmount(balance)}
              </div>
              <div className="text-white/90 text-[12px] font-medium mt-0.5 drop-shadow-sm">
                Balance
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Cards (Cumulative, Withdrawal) */}
          <div className="flex flex-col gap-2.5 h-[215px]">

            {/* Top Right Card: Cumulative */}
            <div
              onClick={() => router.push("/dashboard/investments")}
              className="flex-1 relative rounded-2xl overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99] transition-transform"
            >
              <img
                src="/images/dashboard/cumulative_card.jpg"
                alt="Cumulative"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3">
                <div className="text-white text-[16px] font-extrabold tracking-tight leading-tight drop-shadow-sm">
                  {currencySymbol} {formatAmount(cumulativeIncome)}
                </div>
                <div className="text-white/90 text-[11px] font-medium mt-0.5 drop-shadow-sm">
                  Cumulative
                </div>
              </div>
            </div>

            {/* Bottom Right Card: Withdrawal */}
            <div
              onClick={() => router.push("/dashboard/account/withdrawal")}
              className="flex-1 relative rounded-2xl overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99] transition-transform"
            >
              <img
                src="/images/dashboard/withdrawal_card.jpg"
                alt="Withdrawal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3">
                <div className="text-white text-[16px] font-extrabold tracking-tight leading-tight drop-shadow-sm">
                  {currencySymbol} {formatAmount(totalWithdrawal)}
                </div>
                <div className="text-white/90 text-[11px] font-medium mt-0.5 drop-shadow-sm">
                  Withdrawal
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
