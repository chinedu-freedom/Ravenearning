"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/config/axiosInstance";
import { useEffect, useState, Suspense } from "react";
import { Smartphone, ArrowLeft } from "lucide-react";
import logoImg from "../../../../public/logo.jpeg";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

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
  const siteName = settings.site_name || "suncerestcapital";

  useEffect(() => {
    setIsMounted(true);

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
      <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const rawDigits = data.phone.replace(/[^0-9]/g, '');

    const payload = {
      phone: rawDigits,
      referred_by_code: data.referred_by_code?.trim() || undefined,
      password: data.password,
    };

    signupMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res?.token) {
          setAuthToken(res.token, true);
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem("show_welcome_notice", "true");
        }
        router.push("/dashboard"); 
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6 select-none">
      <div 
        className="relative z-10 w-full max-w-[420px] rounded-2xl shadow-2xl p-7 sm:p-9 bg-[#080d1a] bg-top bg-no-repeat overflow-hidden my-6 border border-slate-800/60 animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundImage: "url('/images/auth/card_bg.jpg')", backgroundSize: "100% auto" }}
      >
        {/* Soft bottom gradient to ensure pristine form field contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080d1a]/60 to-[#080d1a]/95 pointer-events-none" />

        {/* Back to Login Arrow Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute top-5 left-5 z-30 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-sm"
          aria-label="Back to Login"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="relative z-10">
          {/* Top clearance so the 3D gold logo emblem is showcased prominently */}
          <div className="h-28 sm:h-32" />

          <div className="mb-7 text-center">
            <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight drop-shadow-md">
              Sign up
            </h1>
            <p className="text-slate-300 text-sm">
              Sign up for free and start growing your wealth today on {siteName}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone Number */}
            <div>
              <Input 
                label="Phone Number" 
                maxLength={9} 
                placeholder="Enter 9-digit phone number"
                type="tel" 
                {...register("phone")} 
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm Password"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <Controller
                control={control}
                name="referred_by_code"
                render={({ field }) => (
                  <Input 
                    label="Invitation Code (Optional)" 
                    {...field} 
                  />
                )}
              />
              {errors.referred_by_code && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.referred_by_code.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] text-white rounded-full text-base font-bold transition-all shadow-lg shadow-black/20 border border-white/10 cursor-pointer flex items-center justify-center"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <rect width="6" height="14" x="1" y="4" fill="currentColor">
                    <animate id="SVG9ovaHbIP" fill="freeze" attributeName="opacity" begin="0;SVGa89dAd4w.end-0.25s" dur="0.75s" values="1;.2" />
                  </rect>
                  <rect width="6" height="14" x="9" y="4" fill="currentColor" opacity=".4">
                    <animate fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.15s" dur="0.75s" values="1;.2" />
                  </rect>
                  <rect width="6" height="14" x="17" y="4" fill="currentColor" opacity=".3">
                    <animate id="SVGa89dAd4w" fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.3s" dur="0.75s" values="1;.2" />
                  </rect>
                </svg>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          {/* Already have an account */}
          <p className="text-center text-sm text-slate-300 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-amber-300 font-bold hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="w-10 h-10 border-4 border-slate-800 border-t-amber-400 rounded-full animate-spin"></div></div>}>
      <SignupForm />
    </Suspense>
  );
}

