"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Coins, 
  TrendingUp, 
  UserPlus, 
  Copy, 
  QrCode, 
  Check, 
  X,
  Loader2,
  Crown,
  Calendar,
  CreditCard
} from "lucide-react";
import QRCode from "react-qr-code";
import { useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";

export default function TeamPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeLevel, setActiveLevel] = useState(1); // 1 | 2 | 3
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userRes } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const invitationCode = user?.referral_code || "------";

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

  const { data: teamRes, isLoading: isLoadingTeam } = useFetchData("/users/team", ["team-stats"]);
  const { data: memberListRes, isLoading: isLoadingMembers } = useFetchData(
    `/users/team/list?level=${activeLevel}`,
    [`team-members-${activeLevel}`]
  );

  const teamData = teamRes?.data;
  const overview = teamData?.overview || { new_members_today: 0, new_earnings_today: 0, total_team: 0 };
  const levels = teamData?.levels || [
    { level: 1, total_members: 0, valid_members: 0, commission_rate: 30, total_earnings: 0, total_deposits: 0 },
    { level: 2, total_members: 0, valid_members: 0, commission_rate: 50, total_earnings: 0, total_deposits: 0 },
    { level: 3, total_members: 0, valid_members: 0, commission_rate: 5, total_earnings: 0, total_deposits: 0 },
  ];

  const l1 = levels[0] || { total_members: 0, total_earnings: 0, total_deposits: 0, commission_rate: 30 };
  const l2 = levels[1] || { total_members: 0, total_earnings: 0, total_deposits: 0, commission_rate: 50 };
  const l3 = levels[2] || { total_members: 0, total_earnings: 0, total_deposits: 0, commission_rate: 5 };

  const totalMembersCount = (l1.total_members || 0) + (l2.total_members || 0) + (l3.total_members || 0) || overview.total_team || 0;
  const totalTeamCommission = (l1.total_earnings || 0) + (l2.total_earnings || 0) + (l3.total_earnings || 0);
  const totalTeamRecharge = (l1.total_deposits || 0) + (l2.total_deposits || 0) + (l3.total_deposits || 0);

  const currentLevelMembers = memberListRes?.members || memberListRes?.data || [];

  useEffect(() => {
    if (invitationCode && invitationCode !== "------" && typeof window !== "undefined") {
      const origin = window.location.origin;
      setInvitationLink(`${origin}/auth/register?ref=${invitationCode}`);
    }
  }, [invitationCode]);

  const handleCopyLink = () => {
    if (!invitationLink) return;
    navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    toast.success("Invitation link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!invitationCode || invitationCode === "------") return;
    navigator.clipboard.writeText(invitationCode.toString());
    setCopiedCode(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-28 select-none">
      
      {/* Page Title Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-slate-900 text-[22px] font-black tracking-tight leading-tight">
          Team
        </h1>
        <p className="text-slate-500 text-[12.5px] font-medium mt-0.5">
          Partner network
        </p>
      </div>

      <div className="px-4 py-2 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Top 3-Column Hero Stats Card with Blue Palette */}
        <div className="bg-[#111827] rounded-[20px] p-4 text-white shadow-lg border border-white/5 grid grid-cols-3 divide-x divide-white/10 items-center text-center">
          
          {/* Total Members */}
          <div className="flex flex-col items-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] mb-2 shadow-sm">
              <Users size={18} />
            </div>
            <div className="text-gray-300 text-[11px] font-medium">
              Total Members
            </div>
            <div className="text-white text-[18px] font-black mt-0.5 tracking-tight">
              {totalMembersCount}
            </div>
          </div>

          {/* Team Commission */}
          <div className="flex flex-col items-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] mb-2 shadow-sm">
              <Coins size={18} />
            </div>
            <div className="text-gray-300 text-[11px] font-medium">
              Team Commission
            </div>
            <div className="text-[#38bdf8] text-[16px] font-black mt-0.5 tracking-tight">
              {currencySymbol}{formatAmount(totalTeamCommission)}
            </div>
          </div>

          {/* Recharge Volume */}
          <div className="flex flex-col items-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] mb-2 shadow-sm">
              <TrendingUp size={18} />
            </div>
            <div className="text-gray-300 text-[11px] font-medium">
              Recharge Volume
            </div>
            <div className="text-[#38bdf8] text-[16px] font-black mt-0.5 tracking-tight">
              {currencySymbol}{formatAmount(totalTeamRecharge)}
            </div>
          </div>

        </div>

        {/* Invite Friends QR & Links Section */}
        <div className="bg-[#111827] rounded-[24px] p-6 border border-white/5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Decorative subtle background accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[10%] w-4 h-[1px] bg-white/10 -rotate-45" />
            <div className="absolute top-[12%] right-[15%] w-3 h-[1px] bg-white/10 rotate-45" />
            <div className="absolute bottom-[20%] left-[8%] w-4 h-[1px] bg-white/10 rotate-45" />
            <div className="absolute bottom-[15%] right-[12%] w-5 h-[1px] bg-white/10 -rotate-45" />
            <div className="absolute top-[22%] right-[8%] opacity-[0.04] text-[#38bdf8] text-[24px] font-bold">R</div>
          </div>

          <h3 className="text-white text-[16px] font-bold tracking-tight mb-1 relative z-10">
            Invite Friends
          </h3>
          <p className="text-gray-400 text-[11.5px] leading-relaxed max-w-[280px] mb-5 relative z-10">
            Let&apos;s pass {settings.site_name || "Ravenearning"} to the world together, so everyone feels joy and reward
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-[20px] mb-5 shadow-xl relative z-10">
            <div className="w-[140px] h-[140px] flex items-center justify-center rounded-[12px] overflow-hidden">
              {mounted && invitationLink ? (
                <QRCode
                  value={invitationLink}
                  size={140}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 140 140`}
                />
              ) : (
                <QrCode size={140} strokeWidth={1} className="text-[#0f172a]/20" />
              )}
            </div>
          </div>

          {/* Stacked Code & Link Cards */}
          <div className="w-full space-y-2.5 relative z-10">
            {/* Invitation Code */}
            <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-sm text-left">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-gray-400 text-[10.5px] font-medium block">
                  Invitation code
                </span>
                <span className="text-white font-bold text-[14px] font-mono tracking-wider mt-0.5 block">
                  {invitationCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#0284c7]/50 bg-white/5 hover:bg-[#0284c7]/20 flex items-center justify-center text-gray-300 hover:text-[#38bdf8] transition-colors cursor-pointer shrink-0"
                title="Copy Code"
              >
                {copiedCode ? <Check size={14} className="text-[#38bdf8]" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Invitation Link */}
            <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-sm text-left">
              <div className="min-w-0 flex-1 pr-2 overflow-hidden">
                <span className="text-gray-400 text-[10.5px] font-medium block">
                  Invitation link
                </span>
                <span className="text-[#38bdf8] font-bold text-[11.5px] font-mono truncate mt-0.5 block">
                  {invitationLink || "Generating link..."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#0284c7]/50 bg-white/5 hover:bg-[#0284c7]/20 flex items-center justify-center text-gray-300 hover:text-[#38bdf8] transition-colors cursor-pointer shrink-0"
                title="Copy Link"
              >
                {copiedLink ? <Check size={14} className="text-[#38bdf8]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

        </div>

        {/* Section: Team Levels (Using Blue Accent Theme) */}
        <div className="space-y-3 pt-1">
          <h2 className="text-slate-900 text-[16px] font-bold tracking-tight">
            Team Levels
          </h2>

          {/* LV1 Card */}
          <div className="bg-[#111827] border border-white/5 rounded-[20px] p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0b0f19] border border-[#0284c7]/40 flex flex-col items-center justify-center text-white relative shadow-sm">
                  <Crown size={11} className="text-[#38bdf8] -mb-0.5" />
                  <span className="text-[12px] font-black tracking-tight text-[#38bdf8]">LV1</span>
                </div>
                <div className="text-[15px] font-bold text-[#38bdf8]">
                  {l1.commission_rate || 30}%{" "}
                  <span className="text-gray-400 text-[12px] font-normal">
                    Commission
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/5 pt-1 text-center">
              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Members
                </span>
                <span className="text-white text-[16px] font-black mt-0.5 block">
                  {l1.total_members || 0}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Recharge
                </span>
                <span className="text-white text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l1.total_deposits || 0)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Promotion Income
                </span>
                <span className="text-[#38bdf8] text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l1.total_earnings || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* LV2 Card */}
          <div className="bg-[#111827] border border-white/5 rounded-[20px] p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0b0f19] border border-white/10 flex flex-col items-center justify-center text-white relative shadow-sm">
                  <span className="text-[12px] font-black tracking-tight text-white/90">LV2</span>
                </div>
                <div className="text-[15px] font-bold text-[#38bdf8]">
                  {l2.commission_rate || 10}%{" "}
                  <span className="text-gray-400 text-[12px] font-normal">
                    Commission
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/5 pt-1 text-center">
              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Members
                </span>
                <span className="text-white text-[16px] font-black mt-0.5 block">
                  {l2.total_members || 0}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Recharge
                </span>
                <span className="text-white text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l2.total_deposits || 0)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Promotion Income
                </span>
                <span className="text-[#38bdf8] text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l2.total_earnings || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* LV3 Card */}
          <div className="bg-[#111827] border border-white/5 rounded-[20px] p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0b0f19] border border-white/10 flex flex-col items-center justify-center text-white relative shadow-sm">
                  <span className="text-[12px] font-black tracking-tight text-white/90">LV3</span>
                </div>
                <div className="text-[15px] font-bold text-[#38bdf8]">
                  {l3.commission_rate || 5}%{" "}
                  <span className="text-gray-400 text-[12px] font-normal">
                    Commission
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/5 pt-1 text-center">
              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Members
                </span>
                <span className="text-white text-[16px] font-black mt-0.5 block">
                  {l3.total_members || 0}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Recharge
                </span>
                <span className="text-white text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l3.total_deposits || 0)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[11px] font-medium block">
                  Promotion Income
                </span>
                <span className="text-[#38bdf8] text-[14px] font-bold mt-0.5 block">
                  {currencySymbol}{formatAmount(l3.total_earnings || 0)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Section: Team Details */}
        <div className="space-y-3 pt-2">
          
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 text-[16px] font-bold tracking-tight">
              Team Details
            </h2>
            <span className="text-slate-500 text-[12px] font-semibold">
              {currentLevelMembers.length} / {totalMembersCount}
            </span>
          </div>

          <div className="bg-[#111827] rounded-[20px] p-3.5 border border-white/5 shadow-md space-y-3">
            
            {/* Level Tabs Selector with Blue Highlight */}
            <div className="bg-[#0b0f19] border border-white/5 p-1 rounded-xl grid grid-cols-3 gap-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevel(lvl)}
                  className={`py-2 rounded-lg text-[13px] font-bold transition-all relative cursor-pointer text-center ${
                    activeLevel === lvl
                      ? "bg-[#111827] text-[#38bdf8] shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  LV{lvl}
                  {activeLevel === lvl && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#0284c7] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* List Content */}
            <div className="pt-2">
              {isLoadingMembers ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0284c7] mb-2" />
                  <span className="text-[12px] text-gray-500 font-medium">
                    Loading level {activeLevel} records...
                  </span>
                </div>
              ) : currentLevelMembers.length > 0 ? (
                <div className="space-y-2.5">
                  {currentLevelMembers.map((member) => {
                    const memberDeposit = member.deposits?.reduce(
                      (sum, d) => sum + parseFloat(d.amount || 0),
                      0
                    ) || 0;

                    return (
                      <div
                        key={member.id}
                        className="bg-[#0b0f19] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-[#0284c7]/30 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#38bdf8] font-bold text-[12px]">
                            {(member.phone || member.username || "M").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white text-[13px] font-bold leading-tight">
                              {member.phone || member.username || `Member #${member.id.slice(-4)}`}
                            </h4>
                            <div className="flex items-center gap-1 text-gray-400 text-[10.5px] mt-0.5">
                              <Calendar size={10} className="text-[#38bdf8]" />
                              <span>{formatDate(member.created_at || member.joined_at) || 'Recently joined'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-gray-400 text-[10.5px] block font-medium">
                            Deposit
                          </span>
                          <span className="text-[#38bdf8] text-[13.5px] font-black">
                            {currencySymbol}{formatAmount(memberDeposit)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400 text-[13px] font-medium">
                  No data available.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-[24px] p-6 max-w-[340px] w-full text-center space-y-4 shadow-2xl relative">
            
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-white font-bold text-[17px] tracking-tight pt-1">
              Invite QR Code
            </h3>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
              <QRCode
                value={invitationLink || "https://goldengreatland.com"}
                size={180}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 180 180`}
              />
            </div>

            <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-3">
              <span className="text-gray-400 text-[11px] font-medium block">
                Your Invite Code
              </span>
              <span className="text-white text-[17px] font-black font-mono tracking-wider mt-0.5 block">
                {invitationCode}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white font-bold py-3 rounded-xl text-[14px] shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {copiedLink ? "Link Copied!" : "Copy Invite Link"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

