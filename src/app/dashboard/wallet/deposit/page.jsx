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
  Wallet,
  Upload,
  Globe,
  QrCode
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";

const PRESET_AMOUNTS = [350, 900, 2000];

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

    const [amount, setAmount] = useState("350");
  const [selectedMethod, setSelectedMethod] = useState("bank"); // "bank" | "usdt"

  const handleSwitchMethod = (method) => {
    setSelectedMethod(method);
    if (method === "usdt") {
      setAmount("20");
    } else {
      setAmount("350");
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

  const { mutate: submitDeposit, isPending } = usePost("/users/deposit", null, false, { showToast: false });

      const usdtRate = Number(settings.usdt_rate_zar || 18.50);
  const presets = selectedMethod === "usdt" ? [20, 50, 100] : [350, 900, 2000];
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
        paymentMethod: "Online Deposit"
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

                {/* Payment Channel Selector */}
        <div className="pt-1">
          <h2 className="text-slate-900 text-[16px] font-bold tracking-tight mb-3">
            Select Payment Method
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* QuickPay Bank / Card Option */}
            <div
              onClick={() => handleSwitchMethod("bank")}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all flex flex-col justify-between ${
                selectedMethod === "bank"
                  ? "bg-white border-[#03254c] ring-2 ring-[#03254c]/10 shadow-sm"
                  : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#03254c] flex items-center justify-center font-bold">
                  <CreditCard size={19} />
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === "bank" ? "border-[#03254c] bg-[#03254c]" : "border-slate-300"
                }`}>
                  {selectedMethod === "bank" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <div>
                <span className="font-bold text-[14px] text-slate-900 block leading-tight">
                  Bank Deposit
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  South Africa Bank (ZAR)
                </span>
              </div>
            </div>

            {/* Manual USDT Deposit Option */}
            <div
              onClick={() => handleSwitchMethod("usdt")}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all flex flex-col justify-between ${
                selectedMethod === "usdt"
                  ? "bg-white border-[#03254c] ring-2 ring-[#03254c]/10 shadow-sm"
                  : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Wallet size={19} />
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === "usdt" ? "border-[#03254c] bg-[#03254c]" : "border-slate-300"
                }`}>
                  {selectedMethod === "usdt" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <div>
                <span className="font-bold text-[14px] text-slate-900 block leading-tight">
                  Usdt Deposit
                </span>
                <span className="text-[11px] text-amber-600 font-bold">
                  Crypto Deposit (USDT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* USDT Manual Payment Details Card */}
        {selectedMethod === "usdt" && (
          <div className="bg-white border border-amber-200 rounded-[20px] p-5 shadow-sm space-y-4">


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
                    className={`py-2 px-3 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                      usdtNetwork === net
                        ? "bg-[#03254c] text-white border-[#03254c]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    USDT-{net}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Address Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <span className="text-slate-500 text-[11px] font-semibold block">
                Official USDT ({usdtNetwork}) Receiving Address
              </span>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                <span className="font-mono text-[12px] font-bold text-slate-800 truncate pr-2">
                  {activeUsdtAddress}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeUsdtAddress, "usdt_addr")}
                  className="bg-[#03254c] hover:bg-[#021d3c] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
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
                  className={`relative rounded-[12px] py-3.5 px-2 text-center text-[15px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#03254c] text-white shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <span>
                    {selectedMethod === "usdt" ? `${preset} USDT` : `${currencySymbol}${preset.toLocaleString()}`}
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
            <span className="text-slate-800 font-bold text-[16px] mr-2 shrink-0">
              {selectedMethod === "usdt" ? "USDT" : currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={selectedMethod === "usdt" ? "20" : "350"}
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
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 mt-2.5 flex items-center justify-between">
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
            className="w-full bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue to Payment</span>
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
        <Loader2 className="w-8 h-8 animate-spin text-[#03254c]" />
      </div>
    }>
      <RechargeContent />
    </Suspense>
  );
}
