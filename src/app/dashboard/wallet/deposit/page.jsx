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

const PRESET_AMOUNTS = [300, 800, 1500];

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

    const [amount, setAmount] = useState("300");
  const [selectedMethod, setSelectedMethod] = useState("bank"); // "bank" | "usdt"
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
  const calculatedUsdt = (Number(amount || 0) / (usdtRate > 0 ? usdtRate : 18.50)).toFixed(2);
  const activeUsdtAddress = usdtNetwork === "BEP20" 
    ? (settings.usdt_bep20_address || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
    : (settings.usdt_trc20_address || "TYD8x9kL4mN2pQ3vR5sT7uW1xY8zA9bC3d");

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProofBase64(reader.result);
        toast.success("Receipt uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

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

    if (selectedMethod === "usdt") {
      submitDeposit(
        {
          amount: numAmount,
          paymentMethod: `USDT (${usdtNetwork} Manual)`,
                    proof_image_url: proofBase64
        },
        {
          onSuccess: (res) => {
            toast.success(res?.message || "USDT Manual Deposit submitted! Admin will verify and credit your balance.");
            refetchUser();
            router.push("/dashboard/account/recharge");
          }
        }
      );
      return;
    }

    // Direct submit deposit request & redirect to Quick Pay online checkout
    submitDeposit(
      {
        amount: numAmount,
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
              onClick={() => setSelectedMethod("bank")}
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
              onClick={() => setSelectedMethod("usdt")}
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-500 text-[11px] font-medium block">Equivalent USDT Required</span>
                <span className="text-amber-600 font-black text-[22px] font-mono leading-tight">
                  {calculatedUsdt} USDT
                </span>
              </div>
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11.5px] font-bold border border-amber-200">
                Rate: 1 USDT = {currencySymbol} {usdtRate.toFixed(2)}
              </div>
            </div>

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



            {/* Payment Receipt / Screenshot Upload */}
            <div>
              <label className="text-slate-800 font-bold text-[13px] block mb-1.5">
                Upload Proof of Transfer / Receipt (Optional)
              </label>
              <label className="flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#03254c] rounded-xl p-4 cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofChange}
                  className="hidden"
                />
                {proofBase64 ? (
                  <div className="flex items-center gap-3">
                    <img src={proofBase64} alt="Receipt proof" className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                    <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={15} /> Receipt attached!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 text-[13px] font-bold">
                    <Upload size={16} className="text-[#03254c]" />
                    <span>Click to upload transfer screenshot</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

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
