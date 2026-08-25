"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  Info,
  Copy,
  Check,
  Loader2,
  Building2,
  Wallet
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";

const PRESET_AMOUNTS = [300, 800, 1500];

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState("300");
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Fetch settings & current user profile
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";
  const minDeposit = Number(settings.min_deposit || 1000);
  const maxDeposit = Number(settings.max_deposit || 10000000);

  const { data: userRes, refetch: refetchUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const currentBalance = user?.balance || user?.wallet_balance || 0;

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleSelectPreset = (val) => {
    setAmount(val.toString());
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const { mutate: submitDeposit, isPending } = usePost("/users/deposit");

  const handleContinue = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid recharge amount");
      return;
    }

    if (numAmount < minDeposit) {
      toast.error(`Minimum recharge amount is ${currencySymbol} ${minDeposit.toLocaleString()}`);
      return;
    }

    if (numAmount > maxDeposit) {
      toast.error(`Maximum recharge amount is ${currencySymbol} ${maxDeposit.toLocaleString()}`);
      return;
    }

    // Direct submit deposit request & redirect to Quick Pay online checkout
    submitDeposit(
      {
        amount: numAmount,
        paymentMethod: "Quick Pay Online Gateway"
      },
      {
        onSuccess: (res) => {
          if (res?.payUrl) {
            window.location.href = res.payUrl;
          }
        }
      }
    );
  };

  const handleConfirmPaid = () => {
    toast.success("Recharge submitted! Your balance will update upon verification.");
    setShowPaymentModal(false);
    refetchUser();
    router.push("/dashboard/account/recharge");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-start">
      
      {/* Top Header Bar - Deep Royal Navy */}
      <div className="sticky top-0 z-40 bg-[#03254c] text-white px-4 h-14 flex items-center justify-between shadow-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer -ml-1"
          aria-label="Go Back"
        >
          <ArrowLeft size={19} />
        </button>
        <h1 className="text-white text-[17px] font-bold tracking-tight">
          Recharge
        </h1>
        <div className="w-9" />
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Available Balance Card */}
        <div className="bg-[#03254c] rounded-[18px] p-5 text-white shadow-lg shadow-blue-950/20 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="text-sky-100 text-[13px] font-medium">
            Available Balance
          </div>

          <div className="text-[#f59e0b] text-[34px] font-black tracking-tight mt-1 mb-3 leading-none">
            {currencySymbol}{formatAmount(currentBalance)}
          </div>

          <div className="flex items-center gap-2 text-white/85 text-[12px] font-normal">
            <User size={14} className="text-white/80 shrink-0" />
            <span>Instant credit after confirmation</span>
          </div>
        </div>

        {/* Select Amount Section */}
        <div className="pt-1">
          <h2 className="text-slate-900 text-[16px] font-bold tracking-tight mb-3">
            Select amount
          </h2>

          {/* 3 Preset Amount Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = amount === preset.toString();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-[12px] py-3.5 px-2 text-center text-[15px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#03254c] text-white shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <span>
                    {currencySymbol}{preset.toLocaleString()}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-[#f59e0b] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input Box */}
          <div className="bg-white border border-slate-200 rounded-[12px] px-4 py-3 flex items-center shadow-2xs mt-3 focus-within:border-[#03254c] focus-within:ring-1 focus-within:ring-[#03254c] transition-all">
            <span className="text-slate-800 font-bold text-[17px] mr-2 shrink-0">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="300"
              className="bg-transparent text-slate-900 font-bold text-[16px] outline-none flex-1 placeholder:text-slate-400 font-mono"
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount("")}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title="Clear"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
          <p className="text-slate-400 text-[12px] mt-2 font-normal">
            Enter a custom amount or select from the options above.
          </p>
        </div>



        {/* Continue Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isPending}
            className="w-full bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </div>

        {/* Recharge Notes Card */}
        <div className="bg-[#f0f6ff] border border-blue-100 rounded-[16px] p-5 mt-4 space-y-3">
          <div className="flex items-center gap-2 text-[#03254c] font-bold text-[14px]">
            <Info size={17} className="shrink-0" />
            <span>Recharge notes</span>
          </div>

          <div className="text-slate-600 text-[12px] leading-relaxed space-y-2.5 pl-0.5">
            <p>
              1. Minimum recharge amount is <span className="font-semibold text-slate-800">{currencySymbol} {minDeposit.toLocaleString()}</span>.
            </p>
            <p>
              2. The payment amount must match the recharge request amount; otherwise, the funds will not be deposited into your account.
            </p>
            <p>
              3. Each recharge requires a new payment request and a specified receiving account.
            </p>
            <p>
              4. After payment confirmation, the funds will be directly deposited into your account.
            </p>
            <p>
              5. Recharge service is available 24/7.
            </p>
            <p>
              6. Please only recharge through channels provided by the platform.
            </p>
            <p>
              7. If you have not received your funds after an extended period, please contact customer service.
            </p>
          </div>
        </div>

      </div>



    </div>
  );
}

export default function RechargePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#03254c]" />
      </div>
    }>
      <RechargeContent />
    </Suspense>
  );
}
