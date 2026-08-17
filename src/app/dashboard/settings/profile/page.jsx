"use client";

import { useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import {
  ArrowLeft,
  Smartphone,
  Share2,
  Calendar
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: userProfile, isLoading } = useFetchData("/users/me");
  const user = userProfile?.user || {};

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3 flex items-center gap-2.5 sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-gray-400 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Profile Details</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-4">
        {isLoading ? (
          <div className="bg-[#111827] rounded-[16px] border border-white/5 p-6 text-center">
             <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Main Details Card */}
            <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-white/5">
                {/* Phone Number */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Phone Number</div>
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-[#4f8cff]" />
                    <span className="text-white/90 text-[14px]">{user.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Referral Code</div>
                  <div className="flex items-center gap-3">
                    <Share2 size={16} className="text-[#4f8cff]" />
                    <span className="text-white/90 text-[14px]">{user.referral_code || "N/A"}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Member Since</div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#4f8cff]" />
                    <span className="text-white/90 text-[14px]">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Notice */}
            <p className="text-gray-500 text-[12px] text-center px-4">
              Your account is secured by your phone number and security PIN.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
