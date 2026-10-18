"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, X, Users, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";

export default function TeamPage() {
  const router = useRouter();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [activeLevel, setActiveLevel] = useState(1);

  const { data: userRes, isLoading: isLoadingUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const invitationCode = user?.referral_code || "3voa6c";

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

  const level1Config = Number(settings.level1_commission ?? 30);
  const level2Config = Number(settings.level2_commission ?? 10);
  const level3Config = Number(settings.level3_commission ?? 5);

  const levels = teamData?.levels || [
    { level: 1, total_members: 0, valid_members: 0, commission_rate: level1Config, total_earnings: 0 },
    { level: 2, total_members: 0, valid_members: 0, commission_rate: level2Config, total_earnings: 0 },
    { level: 3, total_members: 0, valid_members: 0, commission_rate: level3Config, total_earnings: 0 },
  ];

  const l1 = levels[0] || { total_members: 0, total_earnings: 0, commission_rate: level1Config };
  const l2 = levels[1] || { total_members: 0, total_earnings: 0, commission_rate: level2Config };
  const l3 = levels[2] || { total_members: 0, total_earnings: 0, commission_rate: level3Config };

  const l1Rate = l1.commission_rate ?? level1Config;
  const l2Rate = l2.commission_rate ?? level2Config;
  const l3Rate = l3.commission_rate ?? level3Config;

  const totalMembersCount =
    (l1.total_members || 0) + (l2.total_members || 0) + (l3.total_members || 0) || overview.total_team || 0;
  const totalTeamCommission =
    (l1.total_earnings || 0) + (l2.total_earnings || 0) + (l3.total_earnings || 0);

  const currentLevelMembers = memberListRes?.members || memberListRes?.data || [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const code = user?.referral_code || "3voa6c";
      setInvitationLink(`${origin}/auth/register?ref=${code}`);
    }
  }, [user?.referral_code]);

  const handleCopyLink = () => {
    if (!invitationLink) return;
    navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    toast.success("Invitation link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!invitationCode) return;
    navigator.clipboard.writeText(invitationCode);
    setCopiedCode(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoadingUser && isLoadingTeam) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col min-h-full bg-white sm:bg-[#f8fafc] overflow-y-auto [&::-webkit-scrollbar]:hidden pb-16 select-none">

      {/* Top Title Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-slate-900 text-[26px] font-bold tracking-tight leading-tight">
          Team
        </h1>
      </div>

      <div className="px-4 space-y-3.5 max-w-[480px] mx-auto w-full">

        {/* 1. Hero Runner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden shadow-sm aspect-[0.95/1] sm:aspect-[1.05/1] min-h-[380px] flex flex-col justify-between p-5 text-white">

          {/* Background Sun Emblem */}
          <img
            src="/images/dashboard/team_sun_hero.jpg"
            alt="Team Sun Crest"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Vignette Gradients for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/85 pointer-events-none" />

          {/* Top Row: Total rewards & Total users */}
          <div className="relative z-10 flex items-start justify-between pt-1">

            {/* Total rewards */}
            <div
              onClick={() => setShowRewardsModal(true)}
              className="flex flex-col cursor-pointer group active:scale-95 transition-transform"
            >
              <span className="text-white text-[24px] font-bold tracking-tight leading-none drop-shadow-sm">
                {currencySymbol} {formatAmount(totalTeamCommission || 0)}
              </span>
              <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-1 mt-1.5 drop-shadow-sm group-hover:text-white transition-colors">
                Total rewards &gt;
              </span>
            </div>

            {/* Total users */}
            <div
              onClick={() => setShowUsersModal(true)}
              className="flex flex-col items-end cursor-pointer group active:scale-95 transition-transform"
            >
              <span className="text-white text-[24px] font-bold tracking-tight leading-none drop-shadow-sm">
                {totalMembersCount || 0}
              </span>
              <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-1 mt-1.5 drop-shadow-sm group-hover:text-white transition-colors">
                Total users &gt;
              </span>
            </div>

          </div>

          {/* Bottom Row: Invite Code & Invite Link */}
          <div className="relative z-10 grid grid-cols-2 gap-4 pb-1">

            {/* Invite Code Column */}
            <div className="flex flex-col justify-end">
              <span className="text-white text-[15px] font-bold tracking-tight mb-1 drop-shadow-sm">
                Invite Code
              </span>
              <span className="text-white text-[24px] font-black font-sans tracking-wide leading-tight drop-shadow-sm mb-3">
                {invitationCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full py-2.5 rounded-full border-2 border-white text-white font-bold text-[13.5px] tracking-wider hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {copiedCode ? <Check size={16} /> : "COPY"}
              </button>
            </div>

            {/* Invite Link Column */}
            <div className="flex flex-col justify-end">
              <span className="text-white text-[15px] font-bold tracking-tight mb-1 drop-shadow-sm">
                Invite Link
              </span>
              <p className="text-white/90 text-[11px] font-mono break-all line-clamp-2 h-7 leading-tight mb-3 drop-shadow-sm">
                {invitationLink || `https://suncerestcapital.com/auth/register?ref=${invitationCode}`}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-full bg-white text-black font-bold text-[13.5px] tracking-wider shadow-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {copiedLink ? <Check size={16} className="text-black" /> : "COPY"}
              </button>
            </div>

          </div>

        </div>

        {/* 2. Level 1 Card */}
        <div
          onClick={() => {
            setActiveLevel(1);
            setShowUsersModal(true);
          }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          {/* Level Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] shadow-xs flex items-center justify-center text-amber-400 font-black text-[13px] border border-slate-800 shrink-0">
            Lv1
          </div>

          {/* 3 Stats Columns */}
          <div className="grid grid-cols-3 flex-1 text-center items-center">
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l1Rate}%
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Commission
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l1.total_members || 0}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Users
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {formatAmount(l1.total_earnings || 0)}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Rewards
              </div>
            </div>
          </div>
        </div>

        {/* 3. Level 2 Card */}
        <div
          onClick={() => {
            setActiveLevel(2);
            setShowUsersModal(true);
          }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          {/* Level Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] shadow-xs flex items-center justify-center text-slate-200 font-black text-[13px] border border-slate-800 shrink-0">
            Lv2
          </div>

          {/* 3 Stats Columns */}
          <div className="grid grid-cols-3 flex-1 text-center items-center">
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l2Rate}%
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Commission
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l2.total_members || 0}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Users
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {formatAmount(l2.total_earnings || 0)}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Rewards
              </div>
            </div>
          </div>
        </div>

        {/* 4. Level 3 Card */}
        <div
          onClick={() => {
            setActiveLevel(3);
            setShowUsersModal(true);
          }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          {/* Level Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] shadow-xs flex items-center justify-center text-slate-300 font-black text-[13px] border border-slate-800 shrink-0">
            Lv3
          </div>

          {/* 3 Stats Columns */}
          <div className="grid grid-cols-3 flex-1 text-center items-center">
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l3Rate}%
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Commission
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {l3.total_members || 0}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Users
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black text-slate-900 leading-none">
                {formatAmount(l3.total_earnings || 0)}
              </div>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                Rewards
              </div>
            </div>
          </div>
        </div>

        {/* 5. Rules & Explanation Paragraphs */}
        <div className="text-[13px] text-gray-800 leading-relaxed space-y-2 mt-4 px-1 pb-4">
          <p>
            When a friend you invite registers and invests, you immediately receive a cash reward equal to <strong className="font-bold text-slate-900">{l1Rate}%</strong> of their investment amount.
          </p>
          <p>
            When a member of your Level 2 team invests, you receive a <strong className="font-bold text-slate-900">{l2Rate}%</strong> cash reward.
          </p>
          <p>
            When a member of your Level 3 team invests, you receive a <strong className="font-bold text-slate-900">{l3Rate}%</strong> cash reward.
          </p>
          <p>
            Once your team members invest, the cash rewards are immediately credited to your withdrawable balance and are available for instant withdrawal.
          </p>
        </div>

      </div>

      {/* Users List Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[28px] sm:rounded-3xl w-full max-w-[440px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Team Members</h3>
                <p className="text-xs text-gray-500">Total: {totalMembersCount} users</p>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Level Tabs */}
            <div className="px-5 pt-3 pb-2 flex gap-2">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeLevel === lvl
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>

            {/* Members List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
              {isLoadingMembers ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-800 mb-2" />
                  <span className="text-xs text-gray-500">Loading members...</span>
                </div>
              ) : currentLevelMembers.length > 0 ? (
                currentLevelMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {(member.phone || member.username || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          {member.phone || member.username || `User #${member.id}`}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formatDate(member.created_at || member.joined_at) || "Joined recently"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Deposit</span>
                      <span className="text-xs font-bold text-slate-900">
                        {currencySymbol} {formatAmount(member.total_deposits || 0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No registered members yet for Level {activeLevel}.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Rewards History Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[28px] sm:rounded-3xl w-full max-w-[440px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Commission Overview</h3>
                <p className="text-xs text-gray-500">
                  Total Rewards: {currencySymbol} {formatAmount(totalTeamCommission || 0)}
                </p>
              </div>
              <button
                onClick={() => setShowRewardsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Summary */}
            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl">
                <span className="text-xs text-amber-800 font-medium">Level 1 Direct Referral ({l1Rate}%)</span>
                <div className="text-lg font-bold text-amber-900 mt-1">
                  {currencySymbol} {formatAmount(l1.total_earnings || 0)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 p-4 rounded-2xl">
                <span className="text-xs text-purple-800 font-medium">Level 2 Secondary Referral ({l2Rate}%)</span>
                <div className="text-lg font-bold text-purple-900 mt-1">
                  {currencySymbol} {formatAmount(l2.total_earnings || 0)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 p-4 rounded-2xl">
                <span className="text-xs text-violet-800 font-medium">Level 3 Team Referral ({l3Rate}%)</span>
                <div className="text-lg font-bold text-violet-900 mt-1">
                  {currencySymbol} {formatAmount(l3.total_earnings || 0)}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRewardsModal(false);
                  router.push("/dashboard/transactions");
                }}
                className="w-full mt-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
              >
                <span>View Full Transaction History</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
