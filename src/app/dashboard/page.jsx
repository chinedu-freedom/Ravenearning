"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Volume2, ArrowRight, Play, X, Landmark, Wallet, Mail, BarChart2, ArrowDown, Calendar, FileText, Gift, Users, Settings, MessageSquare } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";

import PageLoader from "@/components/PageLoader";

export default function DashboardPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();

  // Fetch backend settings & profile for support links and language details
  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};

  const { data: userProfileResponse, isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  // Carousel Slides
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
      title: "Ravenearning Cloud Mining",
      subtitle: "Experience next-gen smart mining yield"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      title: "Explore the Ecosystem",
      subtitle: "Daily automated yield on premium mining contracts"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
      title: "Secure Active Mining",
      subtitle: "Guaranteed daily returns with Ravenearning mining packages"
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Auto play carousel slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoadingSettings || isLoadingProfile) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-6">
      
      {/* Top Banner / Hero Carousel */}
      <div className="relative bg-[#0f172a] text-white px-4 pt-5 pb-6 overflow-hidden">
        {/* PWA Install Banner if applicable */}
        {isInstallable && (
          <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl flex items-center justify-between shadow-lg border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Install Ravenearning App</p>
                <p className="text-[10px] text-blue-100 mt-0.5">Quick access & instant notifications</p>
              </div>
            </div>
            <button
              onClick={installPWA}
              className="bg-white text-blue-600 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
            >
              Install
            </button>
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-slate-900/60 aspect-[21/9]">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover filter brightness-[0.65]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4f8cff]">
                  Ravenearning Official
                </span>
                <h2 className="text-base font-black text-white leading-tight mt-0.5">
                  {slide.title}
                </h2>
                <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mt-0.5">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Carousel Indicators */}
          <div className="absolute bottom-2.5 right-3 z-20 flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? "bg-[#4f8cff] w-4" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 space-y-4">

        {/* Action Grid */}
        <div className="bg-[#111827] rounded-[24px] p-4 shadow-sm border border-white/5">
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {[
              { 
                label: "Recharge", 
                icon: <span className="text-[26px]">💰</span>, 
                action: () => router.push('/dashboard/wallet/deposit') 
              },
              { 
                label: "Withdraw", 
                icon: <span className="text-[26px] text-white font-bold">↩</span>, 
                action: () => router.push('/dashboard/wallet/withdraw') 
              },
              { 
                label: "Mine", 
                icon: <span className="text-[26px]">⛏️</span>, 
                action: () => router.push('/dashboard/mining') 
              },
              { 
                label: "Active Mining", 
                icon: <span className="text-[26px]">⚡</span>, 
                action: () => router.push('/dashboard/investments') 
              },
              { 
                label: "Daily Check-in", 
                icon: <span className="text-[26px]">📅</span>, 
                action: () => window.dispatchEvent(new Event('open-daily-checkin')) 
              },
              { 
                label: "Bonus Code", 
                icon: <span className="text-[26px]">🎁</span>, 
                action: () => router.push('/dashboard/treasure') 
              },
              { 
                label: "Referrals", 
                icon: <span className="text-[26px]">👥</span>, 
                action: () => router.push('/dashboard/team') 
              },
              { 
                label: "Support", 
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#38bdf8]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.66-.54.82-1.09.51l-3.02-2.22-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.61-5.07c.24-.22-.05-.34-.38-.13l-6.93 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.64-4.48c.54-.2 1.01.12.84 1.01z"/>
                  </svg>
                ), 
                action: () => router.push('/dashboard/account/service')
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={item.action} 
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="h-8 flex items-center justify-center select-none group-hover:scale-115 transition-transform duration-200">
                  {item.icon}
                </div>
                <span className="text-[10px] text-white/90 font-semibold text-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-[#f0f9ff] text-[#0369a1] px-4 py-2.5 rounded-xl flex items-center gap-2 overflow-hidden shadow-sm border border-sky-200/50">
          <Volume2 size={16} className="shrink-0 text-[#0284c7]" />
          <div className="relative flex-1 overflow-hidden h-4">
            <div className="absolute whitespace-nowrap animate-[marquee_15s_linear_infinite] text-[11.5px] font-extrabold tracking-wide">
              Congratulations to participant *****1777 for inviting friends and earning spins! • Congrats to *****8921 for successfully activating plan! • Welcome new member *****4412 to Ravenearning network! • Get up to 10% daily commissions.
            </div>
          </div>
        </div>

        {/* Two Large Card Buttons (Side-by-side) */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Contact Support Card */}
          <div
            onClick={() => router.push("/dashboard/account/service")}
            className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border border-sky-200/60 rounded-[20px] p-4 flex flex-col justify-between h-[155px] cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div>
              <span className="text-[14px] font-black text-[#0284c7] flex items-center leading-none">
                CONTACT SUPPORT
                <ArrowRight size={13} className="ml-1 shrink-0" />
              </span>
              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-none">
                24/7 Telegram Helpdesk
              </p>
            </div>
            {/* Custom SVG Illustration for Contact Support */}
            <div className="flex justify-end pr-1 pb-1">
              <svg width="55" height="55" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="rgba(2, 132, 199, 0.1)" />
                {/* Headset arc */}
                <path d="M18 34 C18 24.0589 24.268 16 32 16 C39.732 16 46 24.0589 46 34" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                {/* Left earpad */}
                <rect x="15" y="32" width="7" height="13" rx="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                {/* Right earpad */}
                <rect x="42" y="32" width="7" height="13" rx="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                {/* Microphone wire & tip */}
                <path d="M22 41 C22 47 28 47 34 47" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="35" cy="47" r="2.5" fill="#10b981" />
              </svg>
            </div>
          </div>

          {/* Transaction Log Card */}
          <div
            onClick={() => router.push("/dashboard/transactions")}
            className="bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] border border-sky-300/50 rounded-[20px] p-4 flex flex-col justify-between h-[155px] cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div>
              <span className="text-[14px] font-black text-[#0369a1] flex items-center leading-none">
                TRANSACTION LOG
                <ArrowRight size={13} className="ml-1 shrink-0" />
              </span>
              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-none">
                View history & records
              </p>
            </div>
            {/* Custom SVG Illustration for Transaction Log */}
            <div className="flex justify-end pr-1 pb-1">
              <svg width="55" height="55" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="rgba(59, 130, 246, 0.1)" />
                {/* Clipboard body */}
                <rect x="18" y="16" width="28" height="36" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                {/* Clipboard top clip */}
                <rect x="25" y="12" width="14" height="6" rx="2" fill="#0284c7" />
                {/* Document lines */}
                <line x1="24" y1="26" x2="40" y2="26" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="32" x2="36" y2="32" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="38" x2="38" y2="38" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                {/* Badge circle with check */}
                <circle cx="42" cy="44" r="8" fill="#10b981" />
                <path d="M39 44 L41.5 46.5 L45.5 41.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Banner: Lucky Wheel */}
        <div>
          <div
            onClick={() => router.push("/dashboard/spin")}
            className="bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white rounded-2xl p-4 flex justify-between items-center relative overflow-hidden shadow-sm h-[85px] cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="z-10">
              <h4 className="text-[16px] font-black tracking-tight leading-none">Lucky Wheel</h4>
              <p className="text-[11px] text-white/80 font-bold mt-1.5">Spin the wheel & win daily jackpot rewards!</p>
            </div>
            {/* Spinning Wheel Graphic */}
            <div className="absolute right-4 z-0 opacity-90">
              <svg width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[spin_18s_linear_infinite]">
                <circle cx="24" cy="24" r="20" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                <circle cx="24" cy="24" r="16" fill="#ef4444" />
                <path d="M24 4 L24 44 M4 24 H44" stroke="#fff" strokeWidth="1.5" />
                <path d="M9.8 9.8 L38.2 38.2 M9.8 38.2 L38.2 9.8" stroke="#fff" strokeWidth="1.5" />
                <circle cx="24" cy="24" r="4" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="relative rounded-[24px] overflow-hidden shadow-md group">
          <img
            src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80"
            alt="City Skyline Dusk"
            className="w-full h-[180px] object-cover filter brightness-[0.7]"
          />
          {/* Cover gradient overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Centered play button in the middle */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="absolute inset-0 m-auto w-14 h-10 bg-white hover:bg-gray-100 rounded-2xl flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <Play size={20} fill="currentColor" className="text-gray-900 ml-0.5" />
          </button>
        </div>

      </div>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-black border border-white/10 rounded-[24px] w-full max-w-[420px] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3.5 right-3.5 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="relative aspect-video w-full">
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-venice-canal-at-sunset-40984-large.mp4"
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

