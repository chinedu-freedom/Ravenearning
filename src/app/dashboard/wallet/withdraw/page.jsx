"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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

    if (!user?.has_withdrawal_pin) {
      toast.dismiss();
      toast.error("Please create your withdrawal password before withdrawing");
      router.push("/dashboard/account/withdrawal-password");
      return;
    }

    if (withdrawType === "bank" && !hasLinkedBank) {
      toast.dismiss();
      toast.error("Please bind your South Africa bank account before withdrawing");
      router.push("/dashboard/account/bind");
      return;
    }

    if (withdrawType === "usdt" && !hasLinkedUsdt) {
      toast.dismiss();
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start">
      
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white text-slate-900 px-5 h-16 flex items-center justify-between border-b border-slate-100 shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight">
            Withdrawal
          </h1>
        </div>
        <Link
          href="/dashboard/account/withdrawal"
          className="px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
        >
          History
        </Link>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Balances Container - No background */}
        <div className="py-1 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            {/* Total Balance */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-[26px] sm:text-[28px] font-black text-slate-900 tracking-tight leading-none">
                {currencySymbol} {formatAmount(availableBalance)}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-2">
                Total Balance
              </p>
            </div>

            {/* Withdrawable Balance */}
            <div className="flex flex-col items-center justify-center border-l border-slate-200">
              <div className="text-[26px] sm:text-[28px] font-black text-slate-900 tracking-tight leading-none">
                {currencySymbol} {formatAmount(withdrawableBalance)}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mt-2">
                Withdrawable Balance
              </p>
            </div>
          </div>

          {/* Withdrawal Handling Fee */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[13px] text-slate-500 px-1">
            <span className="font-medium">Withdrawal Handling Fee:</span>
            <span className="font-bold text-slate-900">{feePercent}%</span>
          </div>
        </div>

        {/* Withdrawal Destination Selection using Full Width Radio Selectable Divs */}
        <div className="space-y-2">
          <label className="text-slate-900 text-[15px] font-bold tracking-tight block">
            Select Withdrawal Destination
          </label>

          <div className="space-y-2">
            {/* South Africa Bank Option */}
            <div
              onClick={() => setWithdrawType("bank")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                withdrawType === "bank"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  withdrawType === "bank" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Landmark size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    South Africa Bank (Rand)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    Payout to linked bank account
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                withdrawType === "bank" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {withdrawType === "bank" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>

            {/* USDT Crypto Option */}
            <div
              onClick={() => setWithdrawType("usdt")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                withdrawType === "usdt"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  withdrawType === "usdt" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Wallet size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    USDT Wallet (Crypto)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    Payout in USDT TRC20 / BEP20
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                withdrawType === "usdt" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {withdrawType === "usdt" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Section for Selecting Wallets / Banks */}
        <div className="space-y-2">
          <label className="text-slate-900 text-[15px] font-bold tracking-tight block">
            {withdrawType === "bank" ? "Select Bank" : "Select Wallet"}
          </label>

          {withdrawType === "bank" ? (
            hasLinkedBank ? (
              <div className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold shrink-0">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-[14px] text-slate-900 block leading-tight">
                      {bankName}
                    </span>
                    <span className="text-[12px] text-slate-500 font-mono mt-0.5 block">
                      {accountNumber} {accountName ? `(${accountName})` : ""}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/account/bind"
                  className="text-xs font-bold text-[#0f172a] hover:underline shrink-0 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                >
                  Change
                </Link>
              </div>
            ) : (
              <Link
                href="/dashboard/account/bind"
                className="bg-amber-50/70 border border-amber-200 rounded-md p-3.5 flex items-center justify-between hover:bg-amber-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-amber-900 text-[13px] font-bold">
                  <AlertCircle size={17} className="text-amber-600" />
                  <span>No South Africa Bank bound yet</span>
                </div>
                <span className="bg-[#0f172a] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  Choose Bank
                </span>
              </Link>
            )
          ) : (
            hasLinkedUsdt ? (
              <div className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] text-slate-900 block leading-tight">
                      USDT ({usdtNetwork}) Address
                    </span>
                    <span className="text-[11.5px] text-slate-500 font-mono truncate block mt-0.5">
                      {usdtAddress}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/account/bind"
                  className="text-xs font-bold text-[#0f172a] hover:underline shrink-0 ml-2 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                >
                  Change
                </Link>
              </div>
            ) : (
              <Link
                href="/dashboard/account/bind"
                className="bg-amber-50/70 border border-amber-200 rounded-md p-3.5 flex items-center justify-between hover:bg-amber-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-amber-900 text-[13px] font-bold">
                  <AlertCircle size={17} className="text-amber-600" />
                  <span>No USDT Address bound yet</span>
                </div>
                <span className="bg-[#0f172a] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  Bind Wallet
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
          
          <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center shadow-2xs focus-within:border-[#0f172a] focus-within:ring-1 focus-within:ring-[#0f172a] transition-all">
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
              className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors cursor-pointer shrink-0"
            >
              Max
            </button>
          </div>

          {/* Amount Calculation Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mt-3 space-y-1.5 text-[12.5px]">
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
            className="w-full bg-[#0f172a] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-md text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Submit Withdrawal Request</span>
          </button>
        </div>

      </div>

      {/* Confirm Withdrawal Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 p-5 space-y-4">
            
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

            <div className="space-y-2 text-[13px] bg-slate-50 p-3.5 rounded-lg border border-slate-200">
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
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus-within:border-[#0f172a] transition-all">
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
              className="w-full bg-[#0f172a] hover:bg-[#021d3c] text-white font-bold py-3.5 rounded-lg text-[14px] shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <span>Processing</span>
                  <Loader2 size={18} className="animate-spin text-white" />
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
        <Loader2 className="w-8 h-8 animate-spin text-[#0f172a]" />
      </div>
    }>
      <WithdrawContent />
    </Suspense>
  );
}
