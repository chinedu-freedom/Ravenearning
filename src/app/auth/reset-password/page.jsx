"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { usePost, useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import logoImg from "../../../../public/logo.jpeg";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "suncerestcapital";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ usePost hook
  const resetPasswordMutation = usePost("/auth/reset-password", null);

  if (!isMounted || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4f8cff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(form.newPassword)) {
      toast.error(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const phone = sessionStorage.getItem("resetPasswordPhone") || localStorage.getItem("resetEmail");
    if (!phone) {
      toast.error("Session expired. Please request a new reset link.");
      router.push("/auth/forgot-password");
      return;
    }

    // ✅ usePost mutation
    resetPasswordMutation.mutate(
      { phone, newPassword: form.newPassword },
      {
        onSuccess: () => {
          sessionStorage.removeItem("resetPasswordPhone");
          localStorage.removeItem("resetEmail");
          toast.success("Password reset successfully");
          router.push("/"); // redirect to login
        },
        onError: (err) => {
          toast.error(err?.message || "Reset failed. Please try again.");
        },
      }
    );
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
              Reset Password
            </h1>
            <p className="text-slate-300 text-sm">
              Enter your new password and confirm it below for {siteName}.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white hover:brightness-105 active:brightness-95 rounded-full text-base font-bold transition-all shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-70"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-slate-300 mt-6">
              Back to{" "}
              <Link
                href="/"
                className="text-[#4fb3ff] font-bold hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}