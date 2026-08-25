"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Upload, User, Copy, Check } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import axiosInstance, { clearAuthToken } from "@/config/axiosInstance";

import PageLoader from "@/components/PageLoader";

export default function AccountPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();

  const { data: userProfileResponse, isLoading } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const [profilePic, setProfilePic] = useState(null);
  const [copied, setCopied] = useState(false);

  const displayPhone = userProfile?.phone
    ? userProfile.phone.startsWith("27")
      ? userProfile.phone.substring(2)
      : userProfile.phone
    : "";

  const handleCopyId = () => {
    if (!displayPhone) return;
    navigator.clipboard.writeText(displayPhone);
    setCopied(true);
    toast.success("ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (userProfile?.profile_image && !profilePic) {
      setProfilePic(userProfile.profile_image);
    }
  }, [userProfile?.profile_image, profilePic]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setProfilePic(base64Data);
        try {
          const loadingToast = toast.loading("Uploading profile picture...");
          await axiosInstance.put("/users/profile-image", { profile_image: base64Data });
          toast.success("Profile picture updated", { id: loadingToast });
        } catch (error) {
          toast.error("Failed to update profile picture");
          console.error(error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleDownloadApp = () => {
    toast.info("Coming soon");
  };

  const handleCustomerService = () => {
    router.push("/dashboard/account/service");
  };

  const currencySymbol = settings.currency_symbol || "R";
  const cashBalance = parseFloat(userProfile?.balance ?? 0);
  const deviceIncome = parseFloat(userProfile?.statistics?.total_income ?? 0);

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
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-2 select-none">

      {/* Page Title Header */}
      <div className="px-5 pt-4 pb-1">
        <h1 className="text-slate-900 text-[22px] font-black tracking-tight leading-tight">
          Account Center
        </h1>
      </div>

      <div className="px-4 py-2 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Profile Card */}
        <div className="bg-[#111827] rounded-[20px] p-4 border border-white/5 shadow-md flex items-center gap-3.5">
          {/* Avatar badge */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#4f8cff] to-[#0f172a] p-[2px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden group">
            <div className="w-full h-full rounded-full bg-[#111827] flex flex-col items-center justify-center text-center overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : settings?.site_logo ? (
                <img src={settings.site_logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-[#1e293b]">
                  <User className="w-7 h-7 text-[#4f8cff]" />
                </div>
              )}
            </div>
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
            </label>
          </div>

          {/* User Info - Phone Number with Small Copy Icon right after number */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] font-bold text-white tracking-tight truncate">
                ID: {displayPhone || "----"}
              </h2>
              {displayPhone && (
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center shrink-0 active:scale-95"
                  title="Copy ID"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* "My Wallet" Card */}
        <div className="bg-gradient-to-br from-[#4f8cff] via-[#2563eb] to-[#0f172a] rounded-[20px] p-5 text-white shadow-xl relative overflow-hidden border border-white/10">
          {/* Subtle glow decoration */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />

          <h3 className="text-[15px] font-bold text-white/95 mb-4 relative z-10">My Wallet</h3>

          <div className="grid grid-cols-2 relative z-10">
            {/* Cash Balance */}
            <div className="pr-4">
              <p className="text-blue-100/80 text-[12.5px] font-medium mb-1">Cash Balance</p>
              <div className="text-white text-[22px] font-black tracking-tight leading-tight">
                {currencySymbol}{formatAmount(cashBalance)}
              </div>
              <div className="w-7 h-[2.5px] bg-[#6ee7ff] rounded-full mt-2 shadow-[0_0_8px_rgba(110,231,255,0.6)]" />
            </div>

            {/* Device Income */}
            <div className="border-l border-white/20 pl-5">
              <p className="text-blue-100/80 text-[12.5px] font-medium mb-1">Cumulative Income</p>
              <div className="text-white text-[22px] font-black tracking-tight leading-tight">
                {currencySymbol}{formatAmount(deviceIncome)}
              </div>
              <div className="w-7 h-[2.5px] bg-[#6ee7ff] rounded-full mt-2 shadow-[0_0_8px_rgba(110,231,255,0.6)]" />
            </div>
          </div>
        </div>

        {/* First Grid Card (Bind Account, Balance Record, Recharge Record, Withdrawal Record) */}
        <div className="bg-[#111827] rounded-[18px] p-3.5 border border-white/5 shadow-md grid grid-cols-4 items-center divide-x divide-white/5">

          {/* Bind Account */}
          <Link
            href="/dashboard/account/bind"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="7" y="9" width="10" height="6" rx="1" />
                <path d="M7 12h10" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Bind Account
            </span>
          </Link>

          {/* Balance Record */}
          <Link
            href="/dashboard/account/balance"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="16" y2="11" />
                <line x1="8" y1="15" x2="13" y2="15" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Balance Record
            </span>
          </Link>

          {/* Recharge Record */}
          <Link
            href="/dashboard/account/recharge"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <circle cx="17" cy="15" r="3.5" fill="#111827" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18.5 13.5L15.5 16.5M15.5 16.5H18M15.5 16.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Recharge Record
            </span>
          </Link>

          {/* Withdrawal Record */}
          <Link
            href="/dashboard/account/withdrawal"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <circle cx="17" cy="15" r="3.5" fill="#111827" stroke="currentColor" strokeWidth="1.5" />
                <path d="M15.5 16.5L18.5 13.5M18.5 13.5H16M18.5 13.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Withdrawal Record
            </span>
          </Link>

        </div>

        {/* Second Grid Card (Change Password, Withdrawal Password, About us, Download App) */}
        <div className="bg-[#111827] rounded-[18px] p-3.5 border border-white/5 shadow-md grid grid-cols-4 items-center divide-x divide-white/5">

          {/* Change Password */}
          <Link
            href="/dashboard/account/password"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-2 leading-tight">
              Login Password
            </span>
          </Link>

          {/* Withdrawal Password */}
          <Link
            href="/dashboard/account/withdrawal-password"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-sky-900/20 border border-white/5 flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#38bdf8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-2-2l2 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-2 leading-tight">
              Withdrawal Password
            </span>
          </Link>

          {/* About us */}
          <Link
            href="/dashboard/about"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              About us
            </span>
          </Link>

          {/* Download App */}
          <button
            type="button"
            onClick={handleDownloadApp}
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center w-full"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Download App
            </span>
          </button>

          {/* Customer Service */}
          <Link
            href="/dashboard/account/service"
            className="flex flex-col items-center justify-center px-1 py-1 group hover:opacity-80 transition-opacity cursor-pointer text-center w-full"
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-900/20 border border-white/5 flex items-center justify-center text-[#4f8cff] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#4f8cff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/90 mt-2 leading-tight">
              Customer Service
            </span>
          </Link>

        </div>

        {/* Log out Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-[0.99] rounded-[14px] py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-[14px] shadow-sm transition-all cursor-pointer mt-2"
        >
          <LogOut size={16} className="text-red-400" strokeWidth={2.2} />
          <span>Log out</span>
        </button>

      </div>

    </div>
  );
}
