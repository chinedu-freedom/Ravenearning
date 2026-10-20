"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { usePut, useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";

export default function PaymentSettingsPage() {
  const router = useRouter();
  const { data: userRes } = useFetchData("/users/me", ["profile"]);
  const hasPin = !!userRes?.user?.has_withdrawal_pin;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Pass ["profile"] so the query invalidates and updates the "hasPin" UI automatically
  const { mutate: updatePayment, isPending } = usePut("/users/me/payment", ["profile"]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasPin && !currentPassword.trim()) {
      toast.error("Please enter your current trade password");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in both new password fields");
      return;
    }
    if (newPassword.trim().length < 4) {
      toast.error("Trade password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const payload = { newPassword: newPassword.trim() };
    if (hasPin) {
      payload.currentPassword = currentPassword.trim();
    }
    updatePayment(payload, {
      onSuccess: () => {
        toast.success(hasPin ? "Trade password updated successfully" : "Trade password set successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push("/dashboard/settings");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Payment Settings</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full">
        <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm p-5">

          <h2 className="text-white/90 text-[15px] font-bold mb-1.5">
            {hasPin ? "Change Trade Password" : "Trade Password"}
          </h2>
          <p className="text-gray-400 text-[12.5px] leading-relaxed mb-4">
            {hasPin 
              ? "Update your separate trade password to keep your account withdrawals secure." 
              : "Set a separate password for withdrawals to add an extra layer of security to your account."
            }
          </p>

          {!hasPin ? (
            <div className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#d97706] px-3 py-1.5 rounded-full text-[11px] font-medium mb-6">
              <AlertTriangle size={14} className="fill-[#d97706] text-white" />
              Password Not Set
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-[11px] font-medium mb-6">
              <AlertTriangle size={14} className="fill-green-600 text-white" />
              Password Set
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {hasPin && (
              <div className="space-y-1.5">
                <label className="block text-white/80 text-[12.5px] font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-white/80 text-[12.5px] font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="block text-white/80 text-[12.5px] font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:opacity-95 text-white font-bold text-[14px] py-3 rounded-[12px] transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : (hasPin ? "Update Password" : "Set Password")}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
