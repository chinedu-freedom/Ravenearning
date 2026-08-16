"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/config/axiosInstance";
import { useEffect, useState, Suspense } from "react";
import { Smartphone } from "lucide-react";

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
  const siteName = settings.site_name || "Ravenearning";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Left section */}
      <div className="w-full max-w-xl flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
              <img src={siteLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign up</h1>
            <p className="text-gray-500 text-sm">
              Sign up for free and start growing your wealth today on {siteName}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone Number */}
            <div>
              <Input 
                label="Mobile Phone Number" 
                prefix="+27" 
                icon={Smartphone}
                placeholder="Mobile phone number"
                type="tel" 
                {...register("phone")} 
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
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
                <p className="text-red-500 text-sm mt-1">
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
                <p className="text-red-500 text-sm mt-1">
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.referred_by_code.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white rounded-md py-4 font-medium transition-all shadow-sm"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13" /><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13" /><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="1;13" /><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="1;13" /><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13" /><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13" /><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1" /><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1" /><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="13;1" /><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="13;1" /></rect></svg> : "Sign up"}
            </Button>
          </form>

          {/* Already have an account */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-[#4fb3ff] font-medium hover:underline cursor-pointer"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-gray-100 border-t-[#4fb3ff] rounded-full animate-spin"></div></div>}>
      <SignupForm />
    </Suspense>
  );
}

