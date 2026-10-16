"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, KeyRound, Loader2, Eye, EyeOff, Info } from "lucide-react";
import { useFetchData, usePut } from "@/hooks/useApi";
import { toast } from "sonner";

export default function WithdrawalPasswordPage() {
  const router = useRouter();

  const { data: userRes, isLoading: isLoadingUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const hasExistingPin = Boolean(user?.has_withdrawal_pin || user?.withdrawal_pin);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updatePinMutation = usePut("/users/me/payment");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (hasExistingPin && !currentPassword) {
      toast.dismiss(); toast.error("Please enter your current withdrawal password");
      return;
    }

    if (!newPassword) {
      toast.dismiss(); toast.error("Please enter a new withdrawal password");
      return;
    }

    if (newPassword.length < 4) {
      toast.dismiss(); toast.error("Withdrawal password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.dismiss(); toast.error("New withdrawal passwords do not match");
      return;
    }

    const payload = {
      newPassword: newPassword.trim(),
    };
    if (hasExistingPin) {
      payload.currentPassword = currentPassword.trim();
    }

    updatePinMutation.mutate(
      payload,
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success(hasExistingPin ? "Withdrawal password updated successfully!" : "Withdrawal password set successfully!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            router.push("/dashboard/account");
          }, 800);
        },
        onError: (err) => {
          toast.dismiss();
          toast.error("Withdrawal Password Failed", {
            description: err?.response?.data?.message || err?.message || "Could not update withdrawal password",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - White background, Text on left, Logo on right */}
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
            {hasExistingPin ? "Withdrawal Password" : "Set Withdrawal Password"}
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

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Security Overview Stats Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
              Payment Security
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Required for all payouts & bank bindings
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Lock size={22} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">

          {/* Current Withdrawal Password */}
          {hasExistingPin && (
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-bold text-slate-700 block">
                Current Withdrawal Password
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current withdrawal password"
                  disabled={updatePinMutation.isPending}
                  className="bg-transparent outline-none text-slate-900 text-[13.5px] w-full pr-8 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* New Withdrawal Password */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-bold text-slate-700 block">
              {hasExistingPin ? "New Withdrawal Password" : "Create Withdrawal Password"}
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter 4-6 digit withdrawal password"
                disabled={updatePinMutation.isPending}
                className="bg-transparent outline-none text-slate-900 text-[13.5px] w-full pr-8 placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Withdrawal Password */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-bold text-slate-700 block">
              Confirm {hasExistingPin ? "New " : ""}Withdrawal Password
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter withdrawal password"
                disabled={updatePinMutation.isPending}
                className="bg-transparent outline-none text-slate-900 text-[13.5px] w-full pr-8 placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={updatePinMutation.isPending || !newPassword || !confirmPassword || (hasExistingPin && !currentPassword)}
            className="w-full bg-[#0f172a] hover:bg-[#021d3c] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-[14.5px] shadow-md shadow-blue-950/15 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 pt-3"
          >
            {updatePinMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{hasExistingPin ? "Update Withdrawal Password" : "Set Withdrawal Password"}</span>
            )}
          </button>

        </form>

        {/* Security Guidelines Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="text-slate-800 font-bold text-[13px]">
            <span>Important Notice</span>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Your withdrawal password is used exclusively to authorize cash withdrawals and bind destination bank details. Keep it private at all times.
          </p>
        </div>

      </div>

    </div>
  );
}
