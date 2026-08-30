"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Landmark,
  Building2,
  ChevronRight,
  Loader2,
  X,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Wallet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Link from "next/link";

function WithdrawContent() {
  const router = useRouter();

  const [withdrawType, setWithdrawType] = useState("bank"); // "bank" | "usdt"
  const [amount, setAmount] = useState("100");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch settings & current user profile
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";
  const minWithdrawal = Number(settings.min_withdrawal || 100);
  const maxWithdrawal = Number(settings.max_withdrawal || 5000000);
  const feePercent = Number(settings.withdrawal_charge || 15);
  const usdtRate = Number(settings.usdt_rate_zar || 18.50);

  const { data: userRes, refetch: refetchUser, isLoading: isLoadingUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const availableBalance = Number(user?.balance || user?.wallet_balance || 0);
  const withdrawableBalance = Number(user?.withdrawable_balance !== undefined ? user.withdrawable_balance : availableBalance);

  // Bound bank & USDT details
  const bankDetails = user?.bank_details || {};
  const bankName = bankDetails.bank_name || "";
  const accountNumber = bankDetails.account_number || "";
  const accountName = bankDetails.account_name || user?.full_name || "";
  const usdtAddress = bankDetails.usdt_address || user?.usdt_address || "";
  const usdtNetwork = bankDetails.usdt_network || user?.usdt_network || "TRC20";

  const hasLinkedBank = Boolean(accountNumber && bankName);
  const hasLinkedUsdt = Boolean(usdtAddress);

  const numAmount = Number(amount || 0);
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceived = Math.max(0, numAmount - feeAmount);
  const usdtEquivalent = (netReceived / (usdtRate > 0 ? usdtRate : 18.50)).toFixed(2);

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const { mutate: submitWithdraw, isPending } = usePost("/users/withdraw", ["user-profile", "transactions"]);

  const handleOpenConfirm = () => {
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (numAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal amount is ${currencySymbol} ${minWithdrawal.toLocaleString()}`);
      return;
    }

    if (numAmount > maxWithdrawal) {
      toast.error(`Maximum withdrawal amount is ${currencySymbol} ${maxWithdrawal.toLocaleString()}`);
      return;
    }

    if (numAmount > withdrawableBalance) {
      toast.error("Insufficient withdrawable balance");
      return;
    }

    if (withdrawType === "bank" && !hasLinkedBank) {
      toast.error("Please bind your South Africa bank account before withdrawing");
      router.push("/dashboard/account/bind");
      return;
    }

    if (withdrawType === "usdt" && !hasLinkedUsdt) {
      toast.error("Please bind your USDT crypto wallet address before withdrawing");
      router.push("/dashboard/account/bind");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = () => {
    if (!password) {
      toast.error("Please enter your withdrawal password");
      return;
    }

    const payload = {
      amount: numAmount,
      password: password,
      method: withdrawType === "usdt" ? "USDT" : "Bank Transfer",
      network: withdrawType === "usdt" ? usdtNetwork : undefined,
      wallet_address: withdrawType === "usdt" ? usdtAddress : undefined,
      bank_name: withdrawType === "bank" ? bankName : undefined,
      account_number: withdrawType === "bank" ? accountNumber : undefined,
      account_name: withdrawType === "bank" ? accountName : undefined
    };

    submitWithdraw(payload, {
      onSuccess: (res) => {
        toast.success(res?.message || "Withdrawal request submitted successfully!");
        setShowConfirmModal(false);
        setPassword("");
        refetchUser();
        router.push("/dashboard/transactions");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-start">
      
      {/* Top Header Bar */}
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
          Withdrawal
        </h1>
        <Link
          href="/dashboard/transactions"
          className="text-[#f59e0b] hover:text-amber-300 text-[13px] font-bold transition-colors cursor-pointer"
        >
          History
        </Link>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Withdrawable Balance Card */}
        <div className="bg-[#03254c] rounded-[18px] p-5 text-white shadow-lg shadow-blue-950/20 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="text-sky-100 text-[13px] font-medium flex items-center justify-between">
            <span>Withdrawable Balance</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
              Available
            </span>
          </div>

          <div className="text-[#f59e0b] text-[34px] font-black tracking-tight mt-1 mb-3 leading-none">
            {currencySymbol}{formatAmount(withdrawableBalance)}
          </div>

          <div className="flex items-center justify-between text-white/80 text-[12px] pt-1 border-t border-white/10">
            <span>Withdrawal Handling Fee:</span>
            <span className="font-bold text-white">{feePercent}%</span>
          </div>
        </div>

        {/* Withdrawal Method Selection */}
        <div>
          <h2 className="text-slate-900 text-[15px] font-bold tracking-tight mb-2.5">
            Select Withdrawal Destination
          </h2>
          
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {/* Bank Payout Option */}
            <button
              type="button"
              onClick={() => setWithdrawType("bank")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                withdrawType === "bank"
                  ? "bg-white border-[#03254c] ring-2 ring-[#03254c]/10 shadow-sm"
                  : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Landmark size={17} className="text-[#03254c]" />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  withdrawType === "bank" ? "border-[#03254c] bg-[#03254c]" : "border-slate-300"
                }`}>
                  {withdrawType === "bank" && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </div>
              <span className="font-bold text-[13px] text-slate-900 block leading-tight">
                South Africa Bank
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ZAR Account
              </span>
            </button>

            {/* USDT Payout Option */}
            <button
              type="button"
              onClick={() => setWithdrawType("usdt")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                withdrawType === "usdt"
                  ? "bg-white border-amber-500 ring-2 ring-amber-500/10 shadow-sm"
                  : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Globe size={17} className="text-amber-600" />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  withdrawType === "usdt" ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {withdrawType === "usdt" && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </div>
              <span className="font-bold text-[13px] text-slate-900 block leading-tight">
                USDT Wallet
              </span>
              <span className="text-[11px] text-amber-600 font-bold">
                Crypto Payout
              </span>
            </button>
          </div>

          {/* Bound Account Display Card */}
          {withdrawType === "bank" ? (
            hasLinkedBank ? (
              <div className="bg-white border border-slate-200 rounded-[14px] p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#03254c] flex items-center justify-center font-bold">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-[13.5px] text-slate-900 block leading-tight">
                      {bankName}
                    </span>
                    <span className="text-[12px] text-slate-500 font-mono">
                      {accountNumber} ({accountName})
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/account/bind"
                  className="text-xs font-bold text-[#03254c] hover:underline shrink-0"
                >
                  Change
                </Link>
              </div>
            ) : (
              <Link
                href="/dashboard/account/bind"
                className="bg-amber-50 border border-amber-200 rounded-[14px] p-3.5 flex items-center justify-between hover:bg-amber-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-amber-800 text-[13px] font-bold">
                  <AlertCircle size={17} className="text-amber-600" />
                  <span>No South Africa Bank bound yet</span>
                </div>
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  Bind Now
                </span>
              </Link>
            )
          ) : (
            hasLinkedUsdt ? (
              <div className="bg-white border border-amber-200 rounded-[14px] p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[13.5px] text-slate-900 block leading-tight">
                      USDT ({usdtNetwork}) Address
                    </span>
                    <span className="text-[11.5px] text-amber-700 font-mono truncate block">
                      {usdtAddress}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/account/bind"
                  className="text-xs font-bold text-amber-700 hover:underline shrink-0 ml-2"
                >
                  Change
                </Link>
              </div>
            ) : (
              <Link
                href="/dashboard/account/bind"
                className="bg-amber-50 border border-amber-200 rounded-[14px] p-3.5 flex items-center justify-between hover:bg-amber-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-amber-800 text-[13px] font-bold">
                  <AlertCircle size={17} className="text-amber-600" />
                  <span>No USDT Address bound yet</span>
                </div>
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  Bind Now
                </span>
              </Link>
            )
          )}
        </div>

        {/* Enter Amount Section */}
        <div>
          <h2 className="text-slate-900 text-[15px] font-bold tracking-tight mb-2">
            Withdrawal Amount
          </h2>
          
          <div className="bg-white border border-slate-200 rounded-[14px] px-4 py-3 flex items-center shadow-2xs focus-within:border-[#03254c] focus-within:ring-1 focus-within:ring-[#03254c] transition-all">
            <span className="text-slate-800 font-bold text-[18px] mr-2 shrink-0">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="bg-transparent text-slate-900 font-bold text-[18px] outline-none flex-1 placeholder:text-slate-400 font-mono"
            />
            <button
              type="button"
              onClick={() => setAmount(withdrawableBalance.toString())}
              className="text-[#03254c] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors cursor-pointer shrink-0"
            >
              All
            </button>
          </div>

          {/* Amount Calculation Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-3 space-y-1.5 text-[12.5px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Requested Amount:</span>
              <span className="font-bold text-slate-900">{currencySymbol}{formatAmount(numAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Handling Fee ({feePercent}%):</span>
              <span className="font-bold text-rose-600">-{currencySymbol}{formatAmount(feeAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200 text-[13.5px]">
              <span>Net Payout:</span>
              <span className="text-emerald-600 font-black">
                {withdrawType === "usdt"
                  ? `${usdtEquivalent} USDT`
                  : `${currencySymbol} ${formatAmount(netReceived)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Withdrawal Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenConfirm}
            className="w-full bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Submit Withdrawal Request</span>
          </button>
        </div>

      </div>

      {/* Confirm Withdrawal Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-[22px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 font-bold text-[16px]">Confirm Withdrawal</h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 text-[13px] bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Method:</span>
                <span className="font-bold text-slate-900">{withdrawType === "usdt" ? `USDT (${usdtNetwork})` : bankName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Destination:</span>
                <span className="font-bold text-slate-900 font-mono text-[12px] truncate max-w-[200px]">
                  {withdrawType === "usdt" ? usdtAddress : accountNumber}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Net Payout:</span>
                <span className="font-black text-emerald-600 text-[14px]">
                  {withdrawType === "usdt" ? `${usdtEquivalent} USDT` : `${currencySymbol} ${formatAmount(netReceived)}`}
                </span>
              </div>
            </div>

            {/* Withdrawal Password Confirmation Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-800 block">
                Withdrawal Password
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#03254c] transition-all">
                <Lock size={16} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter withdrawal password"
                  className="bg-transparent outline-none text-slate-900 font-bold text-[14px] w-full placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmWithdraw}
              disabled={isPending}
              className="w-full bg-[#03254c] hover:bg-[#021d3c] text-white font-bold py-3.5 rounded-xl text-[14px] shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm & Send Payout</span>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default function WithdrawPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#03254c]" />
      </div>
    }>
      <WithdrawContent />
    </Suspense>
  );
}
