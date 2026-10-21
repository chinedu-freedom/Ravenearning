"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Landmark,
  Wallet,
  Upload,
  Globe,
  QrCode
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";

const PRESET_AMOUNTS = [200, 500, 1000];

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

    const [amount, setAmount] = useState("200");
  const [selectedMethod, setSelectedMethod] = useState("bank"); // "bank" | "usdt"

  const handleSwitchMethod = (method) => {
    setSelectedMethod(method);
    if (method === "usdt") {
      setAmount("20");
    } else {
      setAmount("200");
    }
  };
  const [usdtNetwork, setUsdtNetwork] = useState("TRC20"); // "TRC20" | "BEP20"
    const [proofBase64, setProofBase64] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Fetch settings & current user profile
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";
  const minDeposit = Number(settings.min_deposit || 200);
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

  const { mutate: submitDeposit, isPending } = usePost("/users/deposit", null, false, { showToast: false });

      const usdtRate = Number(settings.usdt_rate_zar || 18.50);
  const presets = selectedMethod === "usdt" ? [20, 50, 100] : [200, 500, 1000];
  const activeUsdtAddress = usdtNetwork === "BEP20"
    ? (settings.usdt_bep20_address || "0xC6DD6e8d226bc069Dd6F8745F3D468EA502F9892")
    : (settings.usdt_trc20_address || "TXmvGTE6PREAYxWarUissgHWMU9f6dhV4V");

  const handleContinue = () => {
    const rawNum = Number(amount);
    if (!amount || isNaN(rawNum) || rawNum <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    if (selectedMethod === "usdt") {
      const zarEquivalent = rawNum * (usdtRate > 0 ? usdtRate : 18.50);

      submitDeposit(
        {
          amount: zarEquivalent,
          paymentMethod: `${rawNum} USDT (${usdtNetwork} Deposit)`
        },
        {
          onSuccess: (res) => {
            toast.success(res?.message || "USDT Deposit submitted! Admin will verify and credit your balance.");
            refetchUser();
            router.push("/dashboard/account/recharge");
          }
        }
      );
      return;
    }

    if (rawNum < minDeposit) {
      toast.error(`Minimum recharge amount is ${currencySymbol} ${minDeposit.toLocaleString()}`);
      return;
    }

    if (rawNum > maxDeposit) {
      toast.error(`Maximum recharge amount is ${currencySymbol} ${maxDeposit.toLocaleString()}`);
      return;
    }

    // Direct submit deposit request & redirect to Quick Pay online checkout
    submitDeposit(
      {
        amount: rawNum,
        paymentMethod: "South Africa Bank"
      },
      {
        onSuccess: (res) => {
          if (res?.payUrl) {
            window.location.href = res.payUrl;
          } else {
            toast.success("Recharge request initiated!");
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start">
      
      {/* Top Header Bar - Clean White */}
      <div className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-100 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Recharge
          </h1>
        </div>
        <Link
          href="/dashboard/account/recharge"
          className="px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
        >
          History
        </Link>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Available Balance Card - Exact format as withdrawal history stats card */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[28px] sm:text-[32px] font-black text-emerald-600 tracking-tight leading-none font-mono">
              {currencySymbol}{formatAmount(currentBalance)}
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">
              Available Balance
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Wallet size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Payment Channel Selector */}
        <div className="pt-1 space-y-2">
          <label className="text-slate-900 text-[15px] font-bold tracking-tight block">
            Select Payment Method
          </label>
          
          <div className="space-y-2">
            {/* South Africa Bank Option */}
            <div
              onClick={() => handleSwitchMethod("bank")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "bank"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  selectedMethod === "bank" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Landmark size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    South Africa Bank (Rand)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    Instant automated online bank transfer
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                selectedMethod === "bank" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {selectedMethod === "bank" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>

            {/* USDT Crypto Option */}
            <div
              onClick={() => handleSwitchMethod("usdt")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "usdt"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  selectedMethod === "usdt" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Wallet size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    USDT Wallet (Crypto)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    TRC20 / BEP20 cryptocurrency deposit
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                selectedMethod === "usdt" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {selectedMethod === "usdt" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* USDT Manual Payment Details Card */}
        {selectedMethod === "usdt" && (
          <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm space-y-4">


            {/* Network Selector */}
            <div>
              <label className="text-slate-800 font-bold text-[13px] block mb-2">
                Select Crypto Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["TRC20", "BEP20"].map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setUsdtNetwork(net)}
                    className={`py-2 px-3 rounded-md border text-[13px] font-bold transition-all cursor-pointer ${
                      usdtNetwork === net
                        ? "bg-[#0f172a] text-white border-[#0f172a]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    USDT-{net}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Address Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2">
              <span className="text-slate-500 text-[11px] font-semibold block">
                Official USDT ({usdtNetwork}) Receiving Address
              </span>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-2.5">
                <span className="font-mono text-[12px] font-bold text-slate-800 truncate pr-2">
                  {activeUsdtAddress}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeUsdtAddress, "usdt_addr")}
                  className="bg-[#0f172a] hover:bg-[#021d3c] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedField === "usdt_addr" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "usdt_addr" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>




          </div>
        )}

                {/* Select Amount Section */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 text-[16px] font-bold tracking-tight">
              Select amount ({selectedMethod === "usdt" ? "USDT" : "Rand"})
            </h2>
            {selectedMethod === "usdt" && (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                1 USDT = {currencySymbol} {usdtRate.toFixed(2)}
              </span>
            )}
          </div>

          {/* 3 Preset Amount Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {presets.map((preset) => {
              const isSelected = amount === preset.toString();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-md py-3.5 px-2 text-center text-[15px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0f172a] text-white shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <span>
                    {selectedMethod === "usdt" ? `${preset} USDT` : `${currencySymbol}${preset.toLocaleString()}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input Box */}
          <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center shadow-2xs mt-3 focus-within:border-[#0f172a] focus-within:ring-1 focus-within:ring-[#0f172a] transition-all">
            <span className="text-slate-800 font-bold text-[16px] mr-2 shrink-0">
              {selectedMethod === "usdt" ? "USDT" : currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={selectedMethod === "usdt" ? "20" : "200"}
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

          {/* Dynamic Conversion Display for USDT */}
          {selectedMethod === "usdt" ? (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-md p-3 mt-2.5 flex items-center justify-between">
              <span className="text-slate-600 text-[12px] font-medium">Converted Rand Value:</span>
              <span className="text-amber-700 font-black text-[15px] font-mono">
                {currencySymbol} {formatAmount(Number(amount || 0) * (usdtRate > 0 ? usdtRate : 18.50))}
              </span>
            </div>
          ) : (
            <p className="text-slate-400 text-[12px] mt-2 font-normal">
              Enter a custom amount or select from the options above.
            </p>
          )}
        </div>

        {/* Continue Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isPending}
            className="w-full bg-[#0f172a] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-md text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isPending ? (
              <>
                <span>Processing</span>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </>
            ) : (
              <span>Continue to Payment</span>
            )}
          </button>
        </div>

        {/* Recharge Notes Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-5 mt-4 space-y-3">
          <div className="flex items-center gap-2 text-[#0f172a] font-bold text-[14px]">
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
              3. For Bank Deposit, you will be redirected to the secure automatic payment gateway.
            </p>
            <p>
              4. After payment confirmation, the funds will be directly deposited into your account balance.
            </p>
            <p>
              5. Recharge service is available 24/7.
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
        <Loader2 className="w-8 h-8 animate-spin text-[#0f172a]" />
      </div>
    }>
      <RechargeContent />
    </Suspense>
  );
}
