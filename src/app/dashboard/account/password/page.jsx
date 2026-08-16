"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import { usePost } from "@/hooks/useApi";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: changePassword, isPending } = usePost("/users/change-password");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error("Please enter your old password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword(
      {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            router.push("/dashboard/account");
          }, 1000);
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to change password");
        },
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
          Change Password
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Hero Card - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-2.5">
            SECURITY CENTER
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            Change Password
          </h2>
          <p className="text-sky-100 text-[12px] leading-relaxed">
            Update your password and protect withdrawal access.
          </p>
        </div>

        {/* Password Form Card */}
        <form onSubmit={handleSubmit} className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-4">
          
          {/* 01 Old Password */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-[6px] bg-[#0284c7]/20 border border-[#0284c7]/30 text-[#38bdf8] text-[10.5px] font-extrabold flex items-center justify-center">
                01
              </span>
              <label className="text-[13px] font-semibold text-white/90">
                Old Password
              </label>
            </div>
            <div className="relative flex items-center bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-transparent outline-none text-white text-[14px] w-full pr-8 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 02 New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-[6px] bg-[#0284c7]/20 border border-[#0284c7]/30 text-[#38bdf8] text-[10.5px] font-extrabold flex items-center justify-center">
                02
              </span>
              <label className="text-[13px] font-semibold text-white/90">
                New Password
              </label>
            </div>
            <div className="relative flex items-center bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="bg-transparent outline-none text-white text-[14px] w-full pr-8 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 03 Confirm Password */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-[6px] bg-[#0284c7]/20 border border-[#0284c7]/30 text-[#38bdf8] text-[10.5px] font-extrabold flex items-center justify-center">
                03
              </span>
              <label className="text-[13px] font-semibold text-white/90">
                Confirm Password
              </label>
            </div>
            <div className="relative flex items-center bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="bg-transparent outline-none text-white text-[14px] w-full pr-8 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="animate-spin text-white" size={18} />
            ) : (
              "Confirm Now"
            )}
          </button>

        </form>

        {/* Security Reminder Card */}
        <div className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#38bdf8]" />
            <h3 className="text-white/90 font-bold text-[14px]">
              Password Security Tips
            </h3>
          </div>

          <div className="space-y-2 text-[12px] text-gray-300 leading-relaxed pl-1">
            <p>
              1. Never disclose your login password to anyone, including customer support personnel.
            </p>
            <p>
              2. Use a combination of letters, numbers, and symbols to ensure maximum security.
            </p>
            <p>
              3. If you notice any suspicious activity, please change your password immediately.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
