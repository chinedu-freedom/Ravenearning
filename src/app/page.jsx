"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { setAuthToken } from "@/config/axiosInstance";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import logoImg from "../../public/logo.jpeg";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
      keepMeLoggedIn: false,
    },
  });

  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "suncerestcapital";

  useEffect(() => {
    setIsMounted(true);
    const rememberedPhone = localStorage.getItem("rememberedPhone");
    if (rememberedPhone) {
      setValue("phone", rememberedPhone);
      setValue("keepMeLoggedIn", true);
    }
  }, [setValue]);

  const loginMutation = usePost("/auth/login", null);

  if (!isMounted || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4fb3ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const keepMeLoggedIn = data.keepMeLoggedIn ?? false;

    if (keepMeLoggedIn) {
      localStorage.setItem("rememberedPhone", data.phone);
    } else {
      localStorage.removeItem("rememberedPhone");
    }

    const rawDigits = data.phone.replace(/[^0-9]/g, '');
    const normalizedPhone = rawDigits.startsWith('27') ? rawDigits : `27${rawDigits}`;

    const payload = {
      phone: normalizedPhone,
      password: data.password,
      keepMeLoggedIn,
    };

    loginMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res?.token) {
          setAuthToken(res.token, keepMeLoggedIn);
        }
        router.push("/dashboard");
      },
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
            <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight drop-shadow-md">
              Welcome back
            </h1>
            <p className="text-slate-300 text-sm">
              Login to access your investment dashboard on {siteName}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input 
                label="Phone Number" 
                prefix="+27" 
                placeholder="Phone number"
                type="tel" 
                {...register("phone")} 
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

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

            <div className="flex items-center justify-between -mt-2">
              <Controller
                name="keepMeLoggedIn"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none group py-1">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                      id="keepMeLoggedIn"
                    />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                     Remember me
                    </span>
                  </label>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white hover:brightness-105 active:brightness-95 rounded-full text-base font-bold transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13" /><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13" /><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="1;13" /><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="1;13" /><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13" /><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13" /><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1" /><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1" /><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="13;1" /><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="13;1" /></rect></svg> : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-300 mt-6">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="text-[#4fb3ff] font-bold hover:underline cursor-pointer">
             Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}