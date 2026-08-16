"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/config/axiosInstance";
import { useEffect, useState, Suspense } from "react";
import { Smartphone, Lock, Gift, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phone: "",
      referred_by_code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = usePost("/auth/register", null);
  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "Ravenearning";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

  useEffect(() => {
    setIsMounted(true);

    // Check URL parameters for referral code
    const refFromUrl = 
      searchParams.get("ref") || 
      searchParams.get("code") || 
      searchParams.get("invite") || 
      searchParams.get("referral");

    if (refFromUrl) {
      setValue("referred_by_code", refFromUrl);
      try {
        localStorage.setItem("referred_by_code", refFromUrl);
      } catch (e) {}
    } else {
      try {
        const storedRef = localStorage.getItem("referred_by_code");
        if (storedRef) {
          setValue("referred_by_code", storedRef);
        }
      } catch (e) {}
    }
  }, [searchParams, setValue]);

  if (!isMounted || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4fb3ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const rawDigits = data.phone.replace(/[^0-9]/g, '');
    const cleanDigits = rawDigits.startsWith('0') ? rawDigits.substring(1) : rawDigits;
    const normalizedPhone = cleanDigits.startsWith('27') ? cleanDigits : `27${cleanDigits}`;

    const payload = {
      phone: normalizedPhone,
      referred_by_code: data.referred_by_code?.trim() || undefined,
      password: data.password,
    };

    signupMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res?.token) {
          setAuthToken(res.token, true);
        }
        router.push("/dashboard"); 
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-3.5">
            <img src={siteLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Sign up for free and start growing your yield on {siteName}
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          
          {/* Mobile Phone Number Input with +27 */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-700 pl-1">Mobile Phone Number</label>
            <div className="flex items-center gap-2.5 w-full bg-white border border-gray-200 rounded-full px-4 py-3.5 focus-within:border-[#4fb3ff] focus-within:ring-2 focus-within:ring-[#4fb3ff]/20 transition-all shadow-sm">
              <Smartphone className="w-5 h-5 text-gray-700 shrink-0" />
              <span className="text-gray-800 font-bold text-sm select-none pr-1">+27</span>
              <input
                type="tel"
                placeholder="Mobile phone number"
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 pl-3 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-700 pl-1">Password</label>
            <div className="flex items-center gap-2.5 w-full bg-white border border-gray-200 rounded-full px-4 py-3.5 focus-within:border-[#4fb3ff] focus-within:ring-2 focus-within:ring-[#4fb3ff]/20 transition-all shadow-sm">
              <Lock className="w-5 h-5 text-gray-700 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 pl-3 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-700 pl-1">Confirm Password</label>
            <div className="flex items-center gap-2.5 w-full bg-white border border-gray-200 rounded-full px-4 py-3.5 focus-within:border-[#4fb3ff] focus-within:ring-2 focus-within:ring-[#4fb3ff]/20 transition-all shadow-sm">
              <Lock className="w-5 h-5 text-gray-700 shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 pl-3 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Referral / Invitation Code */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-semibold text-gray-700">Invitation Code</label>
              <span className="text-[11px] text-gray-400 font-medium">Optional</span>
            </div>
            <div className="flex items-center gap-2.5 w-full bg-white border border-gray-200 rounded-full px-4 py-3.5 focus-within:border-[#4fb3ff] focus-within:ring-2 focus-within:ring-[#4fb3ff]/20 transition-all shadow-sm">
              <Gift className="w-5 h-5 text-gray-700 shrink-0" />
              <Controller
                control={control}
                name="referred_by_code"
                render={({ field }) => (
                  <input
                    type="text"
                    placeholder="Enter referral / invite code"
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium uppercase tracking-wider"
                    {...field}
                  />
                )}
              />
            </div>
            {errors.referred_by_code && (
              <p className="text-red-500 text-xs mt-1 pl-3 font-medium">
                {errors.referred_by_code.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] hover:opacity-95 text-white rounded-full py-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>
        </form>

        {/* Already have an account */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-[#4fb3ff] font-bold hover:underline cursor-pointer"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-gray-100 border-t-[#4fb3ff] rounded-full animate-spin"></div></div>}>
      <SignupForm />
    </Suspense>
  );
}

