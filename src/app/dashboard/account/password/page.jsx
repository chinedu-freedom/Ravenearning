"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  Info
} from "lucide-react";
import { usePut } from "@/hooks/useApi";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: updatePassword, isPending } = usePut("/users/me/password");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      toast.error("Password must contain both letters and numbers");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password cannot be the same as your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    updatePassword(
      {
        currentPassword: currentPassword,
        newPassword: newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            router.push("/dashboard/account");
          }, 800);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || err?.message || "Could not update password");
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
            Change Password
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
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl text-[13px] font-bold">
          <div className="py-2.5 text-center bg-white text-slate-900 rounded-lg shadow-xs">
            Login Password
          </div>
          <Link
            href="/dashboard/account/withdrawal-password"
            className="py-2.5 text-center text-slate-600 hover:text-slate-900 rounded-lg transition-all"
          >
            Withdrawal Password
          </Link>
        </div>

        {/* Security Overview Stats Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
              Login Security
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Protect your account & withdrawals
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <ShieldCheck size={24} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Current Password Field */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-bold text-slate-700 block">
              Current Password
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={isPending}
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

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-bold text-slate-700 block">
              New Password
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters with letters & numbers"
                disabled={isPending}
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-bold text-slate-700 block">
              Confirm New Password
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                disabled={isPending}
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
            disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-[#0f172a] hover:bg-[#021d3c] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-[14.5px] shadow-md shadow-blue-950/15 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 pt-3"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Update Password</span>
            )}
          </button>

        </form>

        {/* Security Guidelines Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="text-slate-800 font-bold text-[13px]">
            <span>Password rules</span>
          </div>
          <ul className="text-[12px] text-slate-500 leading-relaxed space-y-1.5 pl-5 list-disc">
            <li>Password must be at least 8 characters long.</li>
            <li>Must contain a mix of both letters (A-Z) and numbers (0-9).</li>
            <li>Do not reuse your current password or easily guessable dates.</li>
            <li>Platform admins will never ask you for your login password.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
