"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, X, ShieldCheck, ChevronRight } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import { clearAuthToken } from "@/config/axiosInstance";
import PageLoader from "@/components/PageLoader";

// Shokz brand logo with soundwave center icon matching the screenshot exactly
function ShokzLogo({ className = "" }) {
  return (
    <div className={`flex items-center select-none font-sans font-black tracking-wider text-black text-[18px] sm:text-[20px] ${className}`}>
      <span>SH</span>
      <span className="relative inline-flex items-center justify-center mx-[1px] w-5 h-5">
        <svg viewBox="0 0 24 24" className="w-full h-full text-black fill-current" stroke="currentColor" strokeWidth="1.2">
          {/* Center core circle */}
          <circle cx="12" cy="12" r="3.2" />
          {/* Inner soundwave arcs */}
          <path d="M7.8 8.8a4.8 4.8 0 0 0 0 6.4" fill="none" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16.2 8.8a4.8 4.8 0 0 1 0 6.4" fill="none" strokeWidth="2.2" strokeLinecap="round" />
          {/* Outer soundwave arcs */}
          <path d="M5.2 6.5a8 8 0 0 0 0 11" fill="none" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18.8 6.5a8 8 0 0 1 0 11" fill="none" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span>KZ</span>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();
  const [showRegulationModal, setShowRegulationModal] = useState(false);

  const { data: userProfileResponse, isLoading } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleDownloadApp = async () => {
    if (isInstallable) {
      try {
        await installPWA();
      } catch (e) {
        toast.info("Follow browser prompt to install");
      }
    } else {
      toast.success("Add to Home Screen from your browser menu to install.");
    }
  };

  // Format phone number cleanly like screenshot (+27 810770634)
  const formatPhoneNumber = (phone) => {
    if (!phone) return "+27 810770634";
    const cleaned = String(phone).replace(/\s+/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("27")) {
      return `+27 ${cleaned.substring(2)}`;
    }
    return `+27 ${cleaned}`;
  };

  const displayPhone = formatPhoneNumber(userProfile?.phone);
  const userLevel = userProfile?.vip_level ? `Lv${userProfile.vip_level}` : "Lv1";

  const currencySymbol = settings.currency_symbol || "R";
  const cashBalance = userProfile?.balance != null ? Number(userProfile.balance) : 150;
  const cumulativeIncome =
    userProfile?.cumulative_income != null
      ? Number(userProfile.cumulative_income)
      : userProfile?.total_income != null
      ? Number(userProfile.total_income)
      : userProfile?.withdrawable_balance != null
      ? Number(userProfile.withdrawable_balance)
      : 150;

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] overflow-y-auto [&::-webkit-scrollbar]:hidden pb-12 select-none">
      
      {/* Top Header Section with soft, clean background */}
      <div className="relative px-5 pt-7 pb-4 bg-gradient-to-b from-white via-white to-transparent">
        
        {/* User Phone & Level on left, Brand Logo on right */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-[24px] sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
              {displayPhone}
            </h1>
            <div className="mt-2">
              <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-[12px] font-bold text-white bg-[#8233ff] shadow-sm tracking-wide">
                {userLevel}
              </span>
            </div>
          </div>

          {/* Top-Right Logo (SHOKZ) */}
          <div className="pt-1">
            <ShokzLogo />
          </div>
        </div>

        {/* Balance & Income Columns */}
        <div className="grid grid-cols-2 gap-4 mt-7 pt-2">
          {/* Account Balance */}
          <div>
            <div className="text-[25px] sm:text-[27px] font-semibold text-slate-900 tracking-tight leading-none">
              {currencySymbol} {formatAmount(cashBalance)}
            </div>
            <p className="text-[13px] text-gray-500 font-normal mt-2">
              Account Balance
            </p>
          </div>

          {/* Cumulative Income */}
          <div>
            <div className="text-[25px] sm:text-[27px] font-semibold text-slate-900 tracking-tight leading-none">
              {currencySymbol} {formatAmount(cumulativeIncome)}
            </div>
            <p className="text-[13px] text-gray-500 font-normal mt-2">
              Cumulative income
            </p>
          </div>
        </div>

      </div>

      <div className="px-4 space-y-4 max-w-[480px] mx-auto w-full mt-2">

        {/* 1. Quick Action Card (Recharge, Withdraw, Record) */}
        <div className="bg-[#fcfdfd] sm:bg-white rounded-[20px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-gray-100/80 grid grid-cols-3 items-center">
          
          {/* Recharge */}
          <Link
            href="/dashboard/recharge"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-[#8e9aa5] flex items-center justify-center text-white shadow-xs group-hover:bg-[#7b8792] transition-colors">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                {/* Money bag with currency symbol */}
                <path d="M12 2c-.6 0-1.1.4-1.2 1H9a1 1 0 0 0-1 1v.5C8 5.3 8.7 6 9.5 6.2 7.4 7.6 6 10.1 6 13c0 4.4 2.7 8 6 8s6-3.6 6-8c0-2.9-1.4-5.4-3.5-6.8.8-.2 1.5-.9 1.5-1.7V4a1 1 0 0 0-1-1h-1.8c-.1-.6-.6-1-1.2-1zm-1.5 8h3a.6.6 0 0 1 0 1.2h-1.1v1h1.1a.6.6 0 0 1 0 1.2h-1.1v2a.6.6 0 0 1-1.2 0v-2h-.6a.6.6 0 0 1 0-1.2h.6v-1h-.7a.6.6 0 0 1 0-1.2h.7z" />
              </svg>
            </div>
            <span className="text-[13px] text-gray-600 font-normal mt-2 leading-tight">
              Recharge
            </span>
          </Link>

          {/* Withdraw */}
          <Link
            href="/dashboard/withdraw"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 flex items-center justify-center text-[#8e9aa5] group-hover:text-[#7b8792] transition-colors">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                {/* ATM frame */}
                <path d="M4 3h16a2 2 0 0 1 2 2v4H2V5a2 2 0 0 1 2-2z" />
                <rect x="7" y="5.5" width="10" height="1.8" rx="0.5" fill="#fff" opacity="0.9" />
                <path d="M3 10.5h18v2.5H3v-2.5z" opacity="0.3" />
                {/* Cash slot & banknote */}
                <rect x="6" y="14" width="12" height="1.8" rx="0.5" />
                <path d="M5 17h14a1 1 0 0 1 1 1v3H4v-3a1 1 0 0 1 1-1z" />
                <circle cx="12" cy="19" r="1.3" fill="#fff" />
              </svg>
            </div>
            <span className="text-[13px] text-gray-600 font-normal mt-2 leading-tight">
              Withdraw
            </span>
          </Link>

          {/* Record */}
          <Link
            href="/dashboard/transactions"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 flex items-center justify-center text-[#8e9aa5] group-hover:text-[#7b8792] transition-colors">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 2H9a1 1 0 0 0-1 1v1H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V3a1 1 0 0 0-1-1zm-1 2v1h-4V4h4zm-7 5.5h8v1.6H7V9.5zm0 3.8h8v1.6H7v-1.6zm0 3.8h5.5v1.6H7v-1.6z" />
              </svg>
            </div>
            <span className="text-[13px] text-gray-600 font-normal mt-2 leading-tight">
              Record
            </span>
          </Link>

        </div>

        {/* 2. Task Center Banner Card */}
        <div
          onClick={() => router.push("/dashboard/task")}
          className="relative w-full rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] group cursor-pointer active:scale-[0.99] transition-transform aspect-[2.15/1] min-h-[140px]"
        >
          <img
            src="/images/dashboard/task_runner_banner.jpg"
            alt="Task Center"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Text and Button Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-5 sm:px-6 z-10">
            <h3 className="text-white text-[22px] sm:text-[24px] font-bold tracking-tight drop-shadow-sm">
              Task Center
            </h3>
            <p className="text-white/95 text-[13px] mt-1 font-normal drop-shadow-sm max-w-[280px]">
              Complete the task and earn high rewards
            </p>
            <button
              type="button"
              className="mt-3.5 w-fit px-7 py-1.5 bg-white text-gray-900 font-bold text-[13px] rounded-full shadow hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
            >
              Go
            </button>
          </div>
        </div>

        {/* 3. 8-Grid Services Menu */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100/90 grid grid-cols-4 gap-y-7 gap-x-2">

          {/* About us */}
          <Link
            href="/dashboard/about"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              About us
            </span>
          </Link>

          {/* Customer Service */}
          <Link
            href="/dashboard/account/service"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Round head */}
                <circle cx="12" cy="13" r="7" />
                {/* Headset band */}
                <path d="M5 13a7 7 0 0 1 14 0" />
                {/* Headphone ear pads */}
                <rect x="3.5" y="11" width="2" height="4" rx="1" fill="currentColor" />
                <rect x="18.5" y="11" width="2" height="4" rx="1" fill="currentColor" />
                {/* Mic arm and circle */}
                <path d="M19 14v2a2 2 0 0 1-2 2h-3" />
                <circle cx="13" cy="18" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Customer Service
            </span>
          </Link>

          {/* Record */}
          <Link
            href="/dashboard/transactions"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Record
            </span>
          </Link>

          {/* Regulation */}
          <button
            type="button"
            onClick={() => setShowRegulationModal(true)}
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v5" />
                <path d="M4 11V6a2 2 0 0 1 2-2h2" />
                <path d="M4 15v5a2 2 0 0 0 2 2h5" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <line x1="8" y1="10" x2="14" y2="10" />
                <line x1="8" y1="14" x2="11" y2="14" />
                {/* Gear on clipboard bottom corner */}
                <circle cx="17.5" cy="17.5" r="2.8" strokeWidth="1.6" />
                <path d="M17.5 13.8v1.2M17.5 20v1.2M13.8 17.5h1.2M20 17.5h1.2M14.8 14.8l.9.9M19.3 19.3l.9.9M14.8 20.2l.9-.9M19.3 15.7l.9-.9" strokeWidth="1.6" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Regulation
            </span>
          </button>

          {/* Download APP */}
          <button
            type="button"
            onClick={handleDownloadApp}
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Download APP
            </span>
          </button>

          {/* Bind bank card */}
          <Link
            href="/dashboard/account/bind"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Bind bank card
            </span>
          </Link>

          {/* Change Pwd */}
          <Link
            href="/dashboard/account/password"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="11" rx="2.5" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="8.5" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Change Pwd
            </span>
          </Link>

          {/* Redeem Gift */}
          <Link
            href="/dashboard/treasure"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-800">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" rx="1" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-700 font-normal mt-2 leading-tight">
              Redeem Gift
            </span>
          </Link>

        </div>

        {/* Subtle Log Out Option */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium text-[13px] border border-gray-100 shadow-2xs transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>

      </div>

      {/* Regulation Modal */}
      {showRegulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-[420px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Platform Regulation</h3>
              </div>
              <button
                onClick={() => setShowRegulationModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto text-sm text-gray-600 leading-relaxed">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-900 text-[14px] mb-1">1. Account Security</h4>
                <p className="text-xs text-gray-500">
                  Each user is permitted one primary account. Keep your passwords and bound withdrawal cards confidential.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-900 text-[14px] mb-1">2. Recharge & Withdrawal</h4>
                <p className="text-xs text-gray-500">
                  Withdrawal orders are processed according to bank settlement times. Ensure your withdrawal bank account details match your verified ID.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-900 text-[14px] mb-1">3. Tasks & Rewards</h4>
                <p className="text-xs text-gray-500">
                  Tasks must be completed as prescribed. Automated scripts or dishonest manipulation will lead to account restrictions.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRegulationModal(false);
                  router.push("/dashboard/help");
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <span>Read Full Help Center & FAQs</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowRegulationModal(false)}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
