
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
  const siteName = settings.site_name || "Ravenearning";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

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

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
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

    const email = sessionStorage.getItem("resetPasswordEmail");
    if (!email) {
      toast.error("Session expired. Please go back and enter your email again.");
      return;
    }

    verifyOtpMutation.mutate(
      { email, otp: fullOtp },
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
    const email = sessionStorage.getItem("resetPasswordEmail");
    if (!email) {
      toast.error("Session expired. Please go back and enter your email again.");
      return;
    }

    resendOtpMutation.mutate({ email }, {
      onSuccess: () => toast.success("OTP resent successfully"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Left side (OTP Form) */}
      <div className="min-h-screen flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-16 py-12">
        <div className="w-full max-w-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
            <img src={siteLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-sm text-gray-500 mb-8">
            Enter the 4-digit code sent to your email to access {siteName}.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 focus:ring-2 focus:ring-amber-500"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 text-white hover:bg-amber-700 rounded-md py-3 font-medium transition-all"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className={`font-medium cursor-pointer hover:underline ${
                  resendOtpMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-amber-600"
                }`}
               className="cursor-pointer">
                {resendOtpMutation.isPending ? "Resending..." : "Resend"}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right side (Image) */}
       
    </div>
  );
}