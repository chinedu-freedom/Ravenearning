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

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Pass ["profile"] so the query invalidates and updates the "hasPin" UI automatically
  const { mutate: updatePayment, isPending } = usePut("/users/me/payment", ["profile"]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    updatePayment({ newPassword }, {
      onSuccess: () => {
        setNewPassword("");
        setConfirmPassword("");
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
            {hasPin ? "Change Withdrawal Password" : "Withdrawal Password"}
          </h2>
          <p className="text-gray-400 text-[12.5px] leading-relaxed mb-4">
            {hasPin 
              ? "Update your separate withdrawal password to keep your account withdrawals secure." 
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
            <div className="space-y-1.5">
              <label className="block text-white/80 text-[12.5px] font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#4f8cff] transition-all"
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
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#4f8cff] transition-all"
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
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] hover:opacity-95 text-white font-bold text-[14px] py-3 rounded-[12px] transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : (hasPin ? "Update Password" : "Set Password")}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
