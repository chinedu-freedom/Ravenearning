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

const PRESET_AMOUNTS = [5000, 10000, 30000];

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState("5000");
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

    // Submit deposit request
    submitDeposit(
      {
        amount: numAmount,
        paymentMethod: "Official Recharge (Direct Bank Transfer)"
      },
      {
        onSuccess: (res) => {
          setOrderData(res?.deposit || {
            amount: numAmount,
            id: `ORD-${Date.now().toString().slice(-6)}`
          });
          setShowPaymentModal(true);
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
              placeholder="5000"
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

        {/* Payment Method Section */}
        <div className="pt-2">
          <h2 className="text-slate-900 text-[16px] font-bold tracking-tight mb-3">
            Payment method
          </h2>

          <div
            onClick={() => setSelectedMethod("bank")}
            className="bg-white border-2 border-[#03254c] rounded-[16px] p-4 relative flex flex-col justify-between w-[160px] cursor-pointer shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <CreditCard size={22} className="text-slate-800" strokeWidth={1.8} />
              <CheckCircle2 size={18} className="text-[#03254c] fill-[#03254c] text-white" />
            </div>

            <div className="mt-3">
              <h4 className="text-slate-900 font-bold text-[13.5px] leading-tight">
                Official Recharge
              </h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Direct bank transfer
              </p>
            </div>
          </div>
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

      {/* Payment Order Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-[420px] w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#03254c]/10 text-[#03254c] flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-[16px] leading-tight">
                    Official Bank Transfer
                  </h3>
                  <p className="text-slate-500 text-[11.5px]">
                    Direct bank payment channel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Amount Banner */}
            <div className="bg-[#f0f6ff] border border-blue-100 rounded-[14px] p-4 text-center">
              <div className="text-slate-500 text-[11px] font-medium">
                Amount to Transfer
              </div>
              <div className="text-[#03254c] text-[28px] font-black tracking-tight mt-0.5">
                {currencySymbol} {formatAmount(amount)}
              </div>
            </div>

            {/* Account Details Box */}
            <div className="space-y-3 text-[13px]">
              
              {/* Receiving Bank */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">
                    Bank Name
                  </span>
                  <span className="text-slate-900 font-bold text-[13.5px]">
                    Capitec Bank / Standard Bank
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("Capitec Bank", "bank")}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  title="Copy Bank"
                >
                  {copiedField === "bank" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Account Number */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">
                    Account Number
                  </span>
                  <span className="text-slate-900 font-bold text-[15px] font-mono">
                    1052849102
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("1052849102", "account")}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedField === "account" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Beneficiary Name */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">
                    Account Name
                  </span>
                  <span className="text-slate-900 font-bold text-[13.5px]">
                    Omni Platform Ltd
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("Omni Platform Ltd", "name")}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  title="Copy Name"
                >
                  {copiedField === "name" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

            </div>

            {/* Instruction Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11.5px] leading-relaxed">
              ⚠️ Please ensure the exact amount is transferred. Once transferred, tap the button below to confirm.
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmPaid}
                className="w-full bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-[14.5px] shadow-md shadow-blue-950/20 cursor-pointer transition-all"
              >
                I Have Made Payment
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-[13px] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

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
