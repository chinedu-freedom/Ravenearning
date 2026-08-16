"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { setAuthToken } from "@/config/axiosInstance";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Smartphone, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  const siteName = settings.site_name || "Ravenearning";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

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
    const cleanDigits = rawDigits.startsWith('0') ? rawDigits.substring(1) : rawDigits;
    const normalizedPhone = cleanDigits.startsWith('27') ? cleanDigits : `27${cleanDigits}`;

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
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-3.5">
            <img src={siteLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Sign in to access your investment dashboard on {siteName}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          
          {/* Phone Input with +27 */}
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

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1 px-1">
            <Controller
              name="keepMeLoggedIn"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    id="keepMeLoggedIn"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 font-medium select-none">
                    Remember me
                  </span>
                </label>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] hover:opacity-95 text-white rounded-full py-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>

        {/* Register Link */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-[#4fb3ff] font-bold hover:underline cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}