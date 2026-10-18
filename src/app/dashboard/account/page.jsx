"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, 
  X, 
  ShieldCheck, 
  ChevronRight,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  Info,
  Headset,
  ClipboardCheck,
  ScrollText,
  DownloadCloud,
  CreditCard,
  LockKeyhole,
  Gift,
  TrendingUp
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import { clearAuthToken } from "@/config/axiosInstance";
import PageLoader from "@/components/PageLoader";

// Brand logo as a circle without name
function BrandLogo({ className = "" }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Logo"
        className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80"
      />
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

  // Display 9-digit phone number cleanly
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    return String(phone).trim();
  };

  const displayPhone = formatPhoneNumber(userProfile?.phone);
  const userLevel = userProfile?.vip_level ? `Lv${userProfile.vip_level}` : "Lv1";

  const currencySymbol = settings.currency_symbol || "R";
  const cashBalance = userProfile?.balance != null ? Number(userProfile.balance) : 0;
  const withdrawableBalance = userProfile?.withdrawable_balance != null ? Number(userProfile.withdrawable_balance) : 0;

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
            <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              {displayPhone}
            </h1>
            <div className="mt-2">
              <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-[12px] font-bold text-white bg-[#0f172a] shadow-sm tracking-wide">
                {userLevel}
              </span>
            </div>
          </div>

          {/* Top-Right Logo (suncerestcapital) */}
          <div className="pt-1">
            <BrandLogo />
          </div>
        </div>

        {/* Balance & Profit Columns */}
        <div className="grid grid-cols-2 gap-4 mt-7 pt-2 text-center">
          {/* Account Balance */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[25px] sm:text-[27px] font-semibold text-slate-900 tracking-tight leading-none">
              {currencySymbol} {formatAmount(cashBalance)}
            </div>
            <p className="text-[13px] text-gray-500 font-normal mt-2">
              Account Balance
            </p>
          </div>

          {/* Profit / Withdrawable Balance */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[25px] sm:text-[27px] font-semibold text-slate-900 tracking-tight leading-none">
              {currencySymbol} {formatAmount(withdrawableBalance)}
            </div>
            <p className="text-[13px] text-gray-500 font-normal mt-2">
              Profit Balance
            </p>
          </div>
        </div>

      </div>

      <div className="px-4 space-y-4 max-w-[480px] mx-auto w-full mt-2">

        {/* 1. Quick Action Card (Recharge, Withdraw, Record) */}
        <div className="py-2 px-1 grid grid-cols-3 items-center">
          
          {/* Recharge */}
          <Link
            href="/dashboard/recharge"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs group-hover:bg-[#0f172a] group-hover:text-white transition-all group-hover:scale-105">
              <CircleDollarSign size={23} strokeWidth={2} />
            </div>
            <span className="text-[13px] text-gray-700 font-medium mt-2 leading-tight">
              Recharge
            </span>
          </Link>

          {/* Withdraw */}
          <Link
            href="/dashboard/withdraw"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs group-hover:bg-[#0f172a] group-hover:text-white transition-all group-hover:scale-105">
              <Landmark size={22} strokeWidth={2} />
            </div>
            <span className="text-[13px] text-gray-700 font-medium mt-2 leading-tight">
              Withdraw
            </span>
          </Link>

          {/* Record */}
          <Link
            href="/dashboard/transactions"
            className="flex flex-col items-center justify-center py-1 group cursor-pointer text-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs group-hover:bg-[#0f172a] group-hover:text-white transition-all group-hover:scale-105">
              <ReceiptText size={22} strokeWidth={2} />
            </div>
            <span className="text-[13px] text-gray-700 font-medium mt-2 leading-tight">
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
            src="/images/dashboard/task_banner.jpg"
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
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <Info size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              About us
            </span>
          </Link>

          {/* Customer Service */}
          <Link
            href="/dashboard/account/service"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <Headset size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Customer Service
            </span>
          </Link>

          {/* Active Investments */}
          <Link
            href="/dashboard/investments"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <TrendingUp size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Act package
            </span>
          </Link>

          {/* Regulation */}
          <Link
            href="/dashboard/regulation"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <ScrollText size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Regulation
            </span>
          </Link>

          {/* Download APP */}
          <button
            type="button"
            onClick={handleDownloadApp}
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <DownloadCloud size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Download APP
            </span>
          </button>

          {/* Bind bank card */}
          <Link
            href="/dashboard/account/bind"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <CreditCard size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Bind bank card
            </span>
          </Link>

          {/* Change Pwd */}
          <Link
            href="/dashboard/account/password"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <LockKeyhole size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
              Change Pwd
            </span>
          </Link>

          {/* Redeem Gift */}
          <Link
            href="/dashboard/treasure"
            className="flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 flex items-center justify-center text-slate-700 group-hover:text-[#0f172a] transition-colors">
              <Gift size={26} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium mt-1.5 leading-tight">
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
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
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
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-100 text-slate-900 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
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
