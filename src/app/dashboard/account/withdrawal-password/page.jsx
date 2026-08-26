"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { usePut } from "@/hooks/useApi";
import { toast } from "sonner";

export default function WithdrawalPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updatePinMutation = usePut("/users/me/payment");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new withdrawal password");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Withdrawal password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New withdrawal passwords do not match");
      return;
    }

    updatePinMutation.mutate(
      {
        newPassword: newPassword.trim(),
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push("/dashboard/account");
          }, 1000);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24 select-none">
      
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard/account")}
          className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">
          Withdrawal Password
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider mb-2.5">
            <ShieldCheck size={12} className="text-sky-200" />
            <span>PAYMENT SECURITY</span>
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            Withdrawal Password
          </h2>
          <p className="text-sky-100 text-[12.5px] leading-relaxed">
            Set or update your dedicated password required for binding bank details and withdrawing funds.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-4">

          {/* New Withdrawal Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-white/90 block">
              New Withdrawal Password
            </label>
            <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <KeyRound size={18} className="text-[#38bdf8] shrink-0" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter 4-6 digit withdrawal password"
                className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-gray-400 hover:text-white"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Withdrawal Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-white/90 block">
              Confirm New Withdrawal Password
            </label>
            <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <KeyRound size={18} className="text-[#38bdf8] shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new withdrawal password"
                className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updatePinMutation.isPending}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {updatePinMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Withdrawal Password"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
