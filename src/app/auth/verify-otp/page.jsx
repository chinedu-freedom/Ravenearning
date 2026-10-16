
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi"; 
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logoImg from "../../../../public/logo.jpeg";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const { handleSubmit, setValue } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "suncerestcapital";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const verifyOtpMutation = usePost("/auth/verify-otp", null, false);
  const resendOtpMutation = usePost("/auth/resend-otp", null, false);

  if (!isMounted || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#d97706] rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const joinedOtp = newOtp.join("");
    setValue("otp", joinedOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = (data) => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) {
      toast.error("Please enter the full 4-digit OTP code");
      return;
    }

    const phone = sessionStorage.getItem("resetPasswordPhone") || sessionStorage.getItem("resetPasswordEmail");
    if (!phone) {
      toast.error("Session expired. Please go back and enter your phone number again.");
      return;
    }

    verifyOtpMutation.mutate(
      { phone, otp: fullOtp },
      {
        onSuccess: (res) => {
          if (res?.token) {
            sessionStorage.setItem("resetPasswordToken", res.token);
          }
          router.push("/auth/reset-password");
        },
      }
    );
  };

  const handleResend = () => {
    const phone = sessionStorage.getItem("resetPasswordPhone") || sessionStorage.getItem("resetPasswordEmail");
    if (!phone) {
      toast.error("Session expired. Please go back and enter your phone number again.");
      return;
    }

    resendOtpMutation.mutate({ phone }, {
      onSuccess: () => toast.success("OTP resent successfully"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 select-none">
      <div 
        className="relative z-10 w-full max-w-[420px] rounded-none shadow-2xl p-7 sm:p-9 bg-[#080d1a] bg-top bg-no-repeat overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundImage: "url('/images/auth/card_bg.jpg')", backgroundSize: "100% auto" }}
      >
        {/* Soft bottom gradient to ensure pristine form field contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080d1a]/60 to-[#080d1a]/95 pointer-events-none" />

        <div className="relative z-10">
          {/* Top clearance so the 3D gold logo emblem is showcased prominently */}
          <div className="h-28 sm:h-32" />

          <div className="mb-7 text-center">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-md">
              Verify OTP
            </h2>
            <p className="text-sm text-slate-300 mb-8">
              Enter the 4-digit code sent to your phone number to access {siteName}.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-semibold border-white/20 focus:ring-2 focus:ring-[#4fb3ff]"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white hover:brightness-105 active:brightness-95 rounded-full text-base font-bold transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-center text-slate-300">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className={`font-bold cursor-pointer hover:underline ${
                  resendOtpMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#4fb3ff]"
                }`}
              >
                {resendOtpMutation.isPending ? "Resending..." : "Resend"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}